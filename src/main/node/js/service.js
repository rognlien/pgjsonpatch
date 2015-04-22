// Express
var express = require('express');
var bodyParser = require('body-parser')

var app = express();
app.use(express.static('../static'));
app.use(bodyParser.json());

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Postgres
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/benjohan';
var client = new pg.Client(connectionString);
client.connect();


app.get('/ad/:id', function (req, res) {

    var id = req.param("id");

    return getVersions(id, function (versions) {
        var latest = versions[0].id;

        getAd(id, latest, function (ad) {
            console.log(ad);
            ad.versions = versions;
            return res.json(ad);
        });
    });
});


app.get('/ad/:id/:version', function (req, res) {
    var id = req.param("id");
    var version = req.param("version");

    return getVersions(id, function (versions) {
        getAd(id, version, function (ad) {
            ad.versions = versions;
            return res.json(ad);
        });
    });
});

app.post('/ad/:id', function (req, res) {
    var id = req.param("id");

    store(id, req.body, function (version) {
        res.json({"id": id, "version" : version});
    });
});


app.get('/ad/:id/versions', function (req, res) {
    var id = req.param("id");

    getVersions(id, function (versions) {
        return res.json(versions);
    });
});


function store(id, patch, callback) {
    if(patch.length < 1) {
        callback();
        return;
    }

    pg.connect(connectionString, function (err, client, done) {

        client.query('INSERT INTO events (ad, data) VALUES ($1, $2) RETURNING id', [id, JSON.stringify(patch)], function (err, result) {

            console.log("INSERT result: %s", result.rows[0].id);
            // Handle Errors
            if (err) {
                console.log(err);
            }

            done();
            callback(result.rows[0].id);


        });
    });
}

function getAd(id, version, callback) {

    var result;
    pg.connect(connectionString, function (err, client, done) {

        // SQL Query > Select Data query( "select name from emp where emp_id=$1", [123] )
        var query = client.query("SELECT max(ad) AS id, max(id) as version, max(created) AS modified, json_patch_agg(data) AS data FROM events WHERE id <= $2 AND ad = $1 GROUP BY ad;", [id, version]);

        query.on('row', function (row) {
            result = row;
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            client.end();
            callback(result);
        });


        // Handle Errors
        if (err) {
            console.log(err);
        }

    });

}

function getVersions(id, callback) {
    var results = [];
    pg.connect(connectionString, function (err, client, done) {

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM events WHERE ad = $1 ORDER BY id DESC;", [id]);

        console.log(query);

        query.on('row', function (row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            client.end();
            callback(results);
        });

        // Handle Errors
        if (err) {
            console.log(err);
        }

    });
}


app.listen(process.env.PORT || 4730);