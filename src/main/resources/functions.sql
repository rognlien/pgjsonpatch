CREATE OR REPLACE FUNCTION json_patch(data jsonb, patches jsonb) RETURNS jsonb AS
$$
  var jsonData = JSON.parse(data);
  var jsonPatches = JSON.parse(patches);

  jp.apply(jsonData, jsonPatches );

  plv8.elog(LOG, "Patching: " + a + " => " + b);

  return JSON.stringify(jsonData);
$$
LANGUAGE plv8 IMMUTABLE STRICT;

