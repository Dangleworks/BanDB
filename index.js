const fs = require("fs");
// Do a quick check if the config exists, if not, copy the default and exit telling the end user to configure it
if (!fs.existsSync("./config.json")) {
    fs.copyFileSync("./config.default.json", "config.json");
    console.error("Please set up config.json then restart!");
    process.exit(1);
}
const config = require("./config.json");
const mariadb = require('mariadb');
const express = require('express');
const app = express();
mariadb.createConnection(config.sql).then(db => {
    console.log("connected to database")
    if(fs.existsSync("./bans.sql")) {
        db.query(fs.readFileSync("./bans.sql").toString());
    } else {
        console.log("bans.sql does not exist! skipping table creation\nWARNING: THIS MAY CAUSE ISSUES IF YOU HAVENT RAN IT AT LEAST ONCE")
    }
    app.listen(config.stormworks.port, config.stormworks.hostname, () => {
        console.log("webserver started");
    });
    app.get('/check', (req, res) => {
        if (!req.query.steam_id || !req.query.p) {
            return res.send({
                code: 400,
                status: false
            }).end();
        }
		if (req.query.p != config.stormworks.password) return res.send({
			code: 401,
			status: false
		}).end();
        db.query(`SELECT * FROM bans WHERE steam_id = ?`, [req.query.steam_id]).then((response) => {
            if (response[0] === undefined) return res.send({
                status: false
            }).end();
            response[0].status = true;
            res.send(response[0]).end();
        })
    });
	app.get('/checkall', (req, res) => {
		console.log(req.query)
		if (!req.query.ids || !req.query.p) {
            return res.send({
                code: 400,
                status: false
            }).end();
        }
		if (req.query.p != config.stormworks.password) return res.send({
			code: 401,
			status: false
		}).end();
        db.query(`SELECT * FROM bans WHERE steam_id IN (${req.query.ids.replace(/([^0-9]*[^,\d])/g)})`).then((response) => {
            if (response[0] === undefined) return res.send({
                status: false
            }).end();
			res1 = {}
            res1.status = true;
			res1.bans = response
            res.send(res1).end();
        })
	})
    app.get("/ban", (req, res) => {
        if (!req.query.steam_id || !req.query.moderator || !req.query.banned_from || !req.query.username || !req.query.p) return res.send({
            code: 400,
            status: false
        }).end();
		if (req.query.p != config.stormworks.password) return res.send({
			code: 401,
			status: false
		}).end();
		if (req.query.reason == "") req.query.reason = "No Reason Provided"
        db.query('INSERT INTO bans (steam_id, username, reason, moderator, banned_from) VALUES (?,?,?,?,?)', [req.query.steam_id, req.query.username, req.query.reason, req.query.moderator, req.query.banned_from]).then(response => {
            response.status = true;
            response.query = req.query
            res.send(response).end();
			console.log(response);
        }).catch((err) => {
            err.status = false;
            err.query = req.query
            if (err) {
				console.log(err);
				return res.send(err).end()
			}
        })
    })
});