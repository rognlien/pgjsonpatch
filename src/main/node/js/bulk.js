var pg = require('pg');
var randomWords = require('random-words');

var client = new pg.Client('postgres://localhost:5432/benjohan');
client.connect();
client.on('drain', client.end.bind(client));


var generators = [
    {"field": "title", func: function() {
        return randomWords({min: 2, max: 5, join: ' ' });
    }}
    ,{"field": "description", func: function() {
        return randomWords({min: 10, max: 20, join: ' ' });
    }}
    ,{"field": "sold", func: function() {
        return Math.random()<.5;
    }}
];


for (var i = 0; i < 500; i++) {
    for(var x = 0; x < 10; x++) {

        var gen = generators[randInt(3)];

        var query = client.query('INSERT INTO jsonb_commands (record, createdby, path, data) VALUES ($1, $2, $3, $4) RETURNING id'
            , [i, "Pusefinn", "{" + gen.field + "}", JSON.stringify(gen.func())]);

        query.on('row', function (row) {
            console.log("Id: %s", row.id);
        });

    }



}


function randInt(lessThan) {
    return Math.floor(Math.random() * lessThan);
}