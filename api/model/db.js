const Pool = require('pg').Pool;
const Config = require('../config');

const pool = new Pool({
  user: Config.db.user,
  host: Config.db.host,
  database: Config.db.database,
  password: Config.db.password,
  port: 5432,
})

module.exports = pool;