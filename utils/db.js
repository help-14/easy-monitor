const config = require('config');
const dbConfig = config.get('db');

const { Pool } = require('pg');
const pool = new Pool(dbConfig);

function init() {
    pool.connect((err, client, done) => {
        if (err) throw err;
    });
}

module.exports = {
    init: init,
    query: (text, params) => pool.query(text, params),
};