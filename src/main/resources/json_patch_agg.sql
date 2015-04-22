
DROP AGGREGATE IF EXISTS json_patch_agg(json) CASCADE;
CREATE AGGREGATE json_patch_agg(json) (
    SFUNC = json_patch
    ,STYPE = json
    ,initcond = '{}'
);