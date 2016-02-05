CREATE OR REPLACE VIEW records
    AS SELECT max(root) AS id, max(created) AS modified, json_patch_agg(data::json) AS data FROM events GROUP BY root;