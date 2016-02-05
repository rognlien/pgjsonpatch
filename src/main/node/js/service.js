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
var connectionString = 'postgres://localhost:5432/benjohan';
var client = new pg.Client(connectionString);
client.connect();


app.get('/ad/:id', function (req, res) {

    var id = req.param("id");

    return getVersions(id, function (versions) {
        console.log("Versions %s", versions);
        var latest = 0;
        if(versions.length > 0) {
            latest = versions[0].id;
        }

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

    console.log("GET with id: %s version: %s", id, version);

    return getVersions(id, function (versions) {
        getAd(id, version, function (ad) {
            ad.versions = versions;
            return res.json(ad);
        });
    });
});

app.get('/ad/:id/versions', function (req, res) {
    var id = req.param("id");

    getVersions(id, function (versions) {
        return res.json(versions);
    });
});

app.put('/ad/:id', function (req, res) {
    var user = getUsername(req);
    console.log("Posting with: " + user);

    if(!user) {
        console.log("No user");
    }
    var id = req.param("id");

    store(id, user, req.body, function (version) {
        res.json({"id": id, "version" : version});
    });
});


app.post('/ad/', function (req, res) {
    var user = getUsername(req);
    console.log("Posting with: " + user);

    if(!user) {
        console.log("No user");
    }

    create(user, function (id) {
        res.json({"id": id, "version" : 0});
    });
});



function getUsername(req) {
    var encoded = req.headers.authorization.split(' ')[1];
    return new Buffer(encoded, 'base64').toString('utf8').split(":")[0];
}


function create(user, callback) {
    pg.connect(connectionString, function (err, client, done) {

        client.query("SELECT nextval('root_id_seq')"
            ,function (err, result) {

                console.log("Getting next root id: %s", result.rows[0].nextval);
                // Handle Errors
                if (err) {
                    console.log(err);
                }

                done();
                callback(result.rows[0].nextval);

            });
    });
}

function store(id, user, patch, callback) {
    if(patch.length < 1) {
        callback();
        return;
    }

    pg.connect(connectionString, function (err, client, done) {

        client.query('INSERT INTO events (root, username, data) VALUES ($1, $2, $3) RETURNING id'
            ,[id, user, JSON.stringify(patch)]
            ,function (err, result) {

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

    var result = {"id": id};
    pg.connect(connectionString, function (err, client, done) {

        var query = client.query("SELECT max(root) AS id, max(id) as version, max(created) AS modified, json_patch_agg(data::json ORDER BY id ASC) AS data FROM events WHERE id <= $2 AND root = $1 GROUP BY root;", [id, version]);

        "SELECT * FROM aggregated_events WHERE id = "

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
        var query = client.query("SELECT * FROM events WHERE root = $1 ORDER BY id DESC LIMIT 20;", [id]);


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