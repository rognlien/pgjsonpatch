
DROP TABLE IF EXISTS jsonb_commands CASCADE;
CREATE TABLE jsonb_commands (
   id serial primary key
  ,record integer
  ,created timestamp default (now())
  ,createdby VARCHAR(64)
  ,path text[]
  ,data jsonb
);

CREATE INDEX record_idx ON jsonb_commands (record);


CREATE OR REPLACE FUNCTION jsonb_set(jsonb_in jsonb, path text[], replacement jsonb)
  RETURNS jsonb LANGUAGE SQL IMMUTABLE STRICT AS $$
        SELECT jsonb_set($1, $2, $3, true);
$$;


-- jsonb_set without optional create_if_missing
CREATE OR REPLACE FUNCTION jsonb_set(jsonb_in jsonb, path text[], replacement jsonb)
  RETURNS jsonb LANGUAGE SQL IMMUTABLE STRICT AS $$
        SELECT jsonb_set($1, $2, $3, true);
$$;

DROP AGGREGATE IF EXISTS json_set_agg(path text[], replacement jsonb) CASCADE;
CREATE AGGREGATE json_set_agg(path text[], replacement jsonb) (
  sfunc = jsonb_set
  ,stype = jsonb
  ,initcond = '{}'
);

DROP VIEW IF EXISTS records;

CREATE VIEW records AS
  select max(record) as record, max(id) as version, count(id) as revisions, last(createdby) as createdby, json_set_agg(path, data) as data
  from jsonb_commands group by record order by record;



/*
INSERT INTO jsonb_commands (record, createdby, path, data) VALUES
  (1, 'Per', '{title}', '"Per updated title on record number 1"'::jsonb)
  ,(1, 'Per', '{title}', '"Per updated title record number 1 again"'::jsonb)

  ,(2, 'Espen', '{title}', '"Espen updated title record number 1"'::jsonb)
  ,(2, 'Espen', '{contact,email}', '"espen@finn.no"'::jsonb)
  ,(2, 'Espen', '{title}', '"Espen updated title record number 1 again"'::jsonb)
  ,(2, 'Espen', '{address}', '{"street": "Grensen 5-7"}'::jsonb)
;
*/

/*
INSERT INTO jsonb_commands (record, createdby, path, data)
VALUES (2, 'Espen', '{contact,email}', '"espen@finn.no"'::jsonb);


select * from jsonb_commands;
*/
/*
select max(record) as record, max(id) as version, last(createdby) as createdby, json_set_agg(path, data) as data
from jsonb_commands group by record;


select max(record) as record, max(id) as version, count(id) as revisions, last(createdby) as createdby, jsonb_pretty(json_set_agg(path, data)) as data
from jsonb_commands group by record order by record;
*/