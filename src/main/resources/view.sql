CREATE OR REPLACE VIEW ads
    AS SELECT max(root) AS id, max(created) AS modified, json_patch_agg(data) AS data FROM events GROUP BY root;