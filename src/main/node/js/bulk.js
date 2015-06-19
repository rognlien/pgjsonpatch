// Postgres
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/benjohan';
var client = new pg.Client(connectionString);
client.connect();


pg.connect(connectionString, function (err, client, done) {

    var id = 2;
    for(var i = 0; i < 50000; i++) {

        var patch = [{"op": "replace", "path": "/title", "value": "Ad number" + i + " updated"}];
    client.query('INSERT INTO events (ad, data) VALUES ($1, $2) RETURNING id'
        ,[i, JSON.stringify(patch)]
        ,function (err, result) {});
    }
});