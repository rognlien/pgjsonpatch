SELECT max(ad) AS id, max(id) as version, array_agg(id) as versions, max(created) AS modified, json_patch_agg(data)->'title' AS data
FROM events
WHERE id <= 99 AND ad = 2 GROUP BY ad;


select max(id) as id, json_patch_agg(data::json order by id) from events where ad = 6;

ALTER TABLE events ALTER COLUMN data SET DATA TYPE jsonb USING data::jsonb;