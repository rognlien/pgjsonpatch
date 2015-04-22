DROP TABLE IF EXISTS events;

CREATE TABLE events (
  id serial primary key
  ,ad INTEGER
  ,created timestamp default (now())
  ,data json
);