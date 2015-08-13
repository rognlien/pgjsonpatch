DROP TABLE IF EXISTS events;

CREATE TABLE events (
  id serial primary key
  ,root INTEGER
  ,created timestamp default (now())
  ,data json
);


-- Create the patch function
CREATE OR REPLACE FUNCTION json_patch(data json, patches jsonb) RETURNS json AS
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

DROP AGGREGATE IF EXISTS json_patch_agg(jsonb) CASCADE;
CREATE AGGREGATE json_patch_agg(jsonb) (
SFUNC = json_patch
  ,STYPE = json
  ,initcond = '{}'
);