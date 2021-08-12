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
        if (!req.query.steam_id) {
            return res.send({
                code: 400,
                status: false
            }).end();
        }
        db.query(`SELECT * FROM bans WHERE steam_id = ?`, [req.query.steam_id]).then((response) => {
            if (response[0] === undefined) return res.send({
                status: false
            }).end();
            response[0].status = true;
            res.send(response[0]).end();
        })
    });
    app.get("/ban", (req, res) => {
        if (!req.query.steam_id || !req.query.reason || !req.query.moderator || !req.query.banned_from) return res.send({
            code: 400,
            status: false
        }).end();
        db.query('INSERT INTO bans (steam_id, reason, moderator, banned_from) VALUES (?,?,?,?)', [req.query.steam_id, req.query.reason, req.query.moderator, req.query.banned_from]).then(response => {
            response.status = true;
            response.query = req.query
            res.send(response).end();
        }).catch((err) => {
            err.status = false;
            err.query = req.query
            if (err) return res.send(err).end()
        })
    })
});