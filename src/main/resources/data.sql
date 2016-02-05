
INSERT INTO events (root, data) VALUES
  (1, '[
    {"op": "add", "path": "/title", "value": "Record number one"}
    ,{"op": "add", "path": "/description", "value": "This is the original description for record number two"}
    ]')

  ,(1, '[
    {"op": "add", "path": "/keywords", "value": ["Foo", "Bar", "Rex"]}
    ,{"op": "add", "path": "/price", "value": 89.75}
    ]')

  ,(1, '[
    {"op": "replace", "path": "/description", "value": "This is an updated description for record number two" }
    ]')


  ,(2, '[
    {"op": "add", "path": "/title", "value": "Record number two"}
    ,{"op": "add", "path": "/description", "value": "This is the original description for record number two"}
    ]')
  ;

