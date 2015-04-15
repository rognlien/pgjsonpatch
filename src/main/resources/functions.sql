DROP FUNCTION IF EXISTS bendik(a jsonb, b jsonb);

CREATE FUNCTION bendik(a jsonb, b jsonb) RETURNS jsonb AS
$$
  return a
$$
LANGUAGE plv8 IMMUTABLE STRICT;


CREATE AGGREGATE bendikagg(jsonb) (
    SFUNC = bendik,
    STYPE = jsonb);