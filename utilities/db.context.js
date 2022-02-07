const pg = require('pg');
require('dotenv').config();
/**
 * Uncomment the following for LOCAL development.
 */

// let config = {
//     host: process.env.PGHOST,
//     port: process.env.PGPORT,
//     database: process.env.PGDATABASE,
//     max: 10, // max number of clients in the pool
//     idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
// };

// const pool = new pg.Pool(config);

// Prod connection:
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

/**
 * Emits an error on behalf of idle clients due to backend errors
 */
pool.on('error', (err) => {
  console.log('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * [async] Query Postgres database.
 * @param {*} text Query string
 * @param {*} values Values for query string
 * @returns Response from db, if any. Typically, any[].
 */
const query = async (text, values) => {
  try {
    const res = await pool.query(text, values);
    return res;
  } catch (error) {
    console.log('Error in query', error);
    return error;
  }
};

module.exports = { query };
