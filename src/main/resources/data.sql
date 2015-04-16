
INSERT INTO events (ad, data) VALUES
  (2, '[
    {"op": "add", "path": "/title", "value": "This is the title"}
    ,{"op": "add", "path": "/description", "value": "This is the description"}
    , {"op": "replace", "path": "/title", "value": "The title has been replaced" }
    ]')

  ,(2, '[{"op": "remove", "path": "/description"}]');

