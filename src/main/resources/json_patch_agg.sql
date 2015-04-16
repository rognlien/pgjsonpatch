DROP AGGREGATE IF EXISTS json_patch_agg(jsonb) CASCADE;
CREATE AGGREGATE json_patch_agg(jsonb) (
    SFUNC = json_patch
    ,STYPE = jsonb
    ,initcond = '{}'
);