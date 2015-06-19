CREATE OR REPLACE FUNCTION json_patch(data json, patches jsonb) RETURNS json AS
$$
  jp.apply(data, patches);
  return data;
$$
LANGUAGE plv8 IMMUTABLE STRICT;

