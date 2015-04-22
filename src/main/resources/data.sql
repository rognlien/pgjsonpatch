
INSERT INTO events (ad, data) VALUES
  (2, '[
    {"op": "add", "path": "/title", "value": "The original title"}
    ,{"op": "add", "path": "/description", "value": "This is the original description"}
    ]')

  ,(2, '[
    {"op": "add", "path": "/keywords", "value": ["Foo", "Bar", "Rex"]}
    ,{"op": "add", "path": "/price", "value": 89.75}
    ]')

  ,(2, '[
    {"op": "replace", "path": "/title", "value": "The updated title" }
    ]')
  ;

