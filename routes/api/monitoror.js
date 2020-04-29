const Router = require('express-promise-router');
const db = require('../../utils/db');
const data = require('../../utils/data');

const config = require('config');
const reportColumn = config.get('reportColumn');

const router = new Router();

router.get('/', async function (req, res, next) {
    let json = {
        version: "1.0",
        columns: reportColumn,
        tiles: []
    };

    let cachedData = await data.GetCacheData();
    for (let server of cachedData) {
        json.tiles.push({
            type: "PING",
            label: server.name,
            params: { "hostname": server.ip }
        });
        json.tiles.push({
            type: "HTTP-FORMATTED",
            label: `CPU`,
            params: {
                format: "JSON",
                url: `http://localhost:3000/api/stats/cpu/${server.id}`,
                key: "result"
            }
        });
        json.tiles.push({
            type: "HTTP-FORMATTED",
            label: `Memory`,
            params: {
                format: "JSON",
                url: `http://localhost:3000/api/stats/memory/${server.id}`,
                key: "result"
            }
        });
        json.tiles.push({
            type: "HTTP-FORMATTED",
            label: `Disk used`,
            params: {
                format: "JSON",
                url: `http://localhost:3000/api/stats/disk/${server.id}`,
                key: "result"
            }
        });
        json.tiles.push({
            type: "HTTP-FORMATTED",
            label: `Process Count`,
            params: {
                format: "JSON",
                url: `http://localhost:3000/api/stats/process/${server.id}`,
                key: "result"
            }
        });
        json.tiles.push({
            type: "HTTP-FORMATTED",
            label: `Opened files`,
            params: {
                format: "JSON",
                url: `http://localhost:3000/api/stats/openFiles/${server.id}`,
                key: "result"
            }
        });
    }

    res.json(json);
});

module.exports = router;