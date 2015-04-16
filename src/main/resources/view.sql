CREATE OR REPLACE VIEW ads
    AS SELECT max(ad) AS id, max(created) AS modified, json_patch_agg(data) AS data FROM events GROUP BY ad;