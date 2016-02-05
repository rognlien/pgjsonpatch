CREATE EXTENSION IF NOT EXISTS plv8;

DROP TABLE IF EXISTS plv8_modules;
create table plv8_modules(modname text primary key, load_on_start boolean, code text);


\set jsonpatch `cat /Users/benjohan/git/pgjsonpatch/src/main/resources/json-patch.min.js`
insert into plv8_modules values ('jsonpatch',true, :'jsonpatch');

create or replace function plv8_startup()
  returns void
  language plv8
  as
  $$

  plv8.elog(NOTICE, "Running plv8_startup()");

  load_module = function(modname) {
    plv8.elog(NOTICE, "Loading module: " + modname);
    var rows = plv8.execute("SELECT code from plv8_modules where modname = $1", [modname]);

    for (var r = 0; r < rows.length; r++) {
      var code = rows[r].code;
      eval("(function() { " + code + "})")();
    }
  };


  // now load all the modules marked for loading on start
  var rows = plv8.execute("SELECT modname, code from plv8_modules where load_on_start");
  for (var r = 0; r < rows.length; r++) {
    var code = rows[r].code;
    eval("(function() { " + code + "})")();
  }
  $$;

/*
select plv8_startup();
do language plv8 'load_module("jsonpatch");';
do language plv8 $$

var root = {a: 1};
var patches = [
   {op:"replace", path:"/a", value:2}
   ];
jp.apply( root, patches );

plv8.elog(NOTICE, "Verifying json patch: " + (root.a == 2 ? "Success" : "Failure"));

$$;
*/





DROP TABLE IF EXISTS events CASCADE;

CREATE TABLE events (
  id serial primary key
  ,username VARCHAR(64)
  ,root INTEGER
  ,created timestamp default (now())
  ,data jsonb
);

DROP SEQUENCE IF EXISTS root_id_seq;
CREATE SEQUENCE root_id_seq;



/*
CREATE TABLE records (
   id serial primary key
  ,created timestamp default (now())
  ,updated timestamp default (now())
  ,updatedby VARCHAR(64)
  ,data jsonb
);


CREATE TABLE record_updates (
   id serial primary key
  ,record integer REFERENCES records(id)
  ,created timestamp default (now())
  ,createdby VARCHAR(64)
  ,path text[]
  ,data jsonb
);
*/


-- Create the patch function
CREATE OR REPLACE FUNCTION json_patch(data json, patches json) RETURNS json AS
  $$
  jp.apply(data, patches);
  return data;
$$
LANGUAGE plv8 IMMUTABLE STRICT;


-- Create the patch aggregate function utilizing the patch function
DROP AGGREGATE IF EXISTS json_patch_agg(json) CASCADE;
CREATE AGGREGATE json_patch_agg(json) (
SFUNC = json_patch
  ,STYPE = json
  ,initcond = '{}'
);

/*
DROP AGGREGATE IF EXISTS json_patch_agg(jsonb) CASCADE;
CREATE AGGREGATE json_patch_agg(jsonb) (
SFUNC = json_patch
  ,STYPE = json
  ,initcond = '{}'
);
*/


-- Create a function that always returns the last non-NULL item
CREATE OR REPLACE FUNCTION public.last_agg ( anyelement, anyelement )
  RETURNS anyelement LANGUAGE SQL IMMUTABLE STRICT AS $$
        SELECT $2;
$$;

-- And then wrap an aggregate around it
DROP AGGREGATE IF EXISTS public.LAST(ANYELEMENT) CASCADE;
CREATE AGGREGATE public.LAST (
sfunc    = public.last_agg,
basetype = anyelement,
stype    = anyelement
);


DROP VIEW IF EXISTS aggregated_events;
CREATE VIEW aggregated_events AS
  SELECT max(root) AS id, max(id) as version, max(created) AS modified, last(username) as modifiedby
,json_patch_agg(data::json ORDER BY id ASC) AS data
FROM events GROUP BY root;