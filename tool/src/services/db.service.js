const { Pool } = require('pg');
const { db: credentials } = require('../configs/config');

const pool = new Pool(credentials);

module.exports = {
    query: async (text, params) => {
        return await pool.query(text, params)
    },
}