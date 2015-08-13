

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