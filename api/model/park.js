const pool = require("./db");
const axios = require("axios").default;

let Park = {};

Park.getParkById = async (id) => {
  const result = await pool.query(
    "SELECT park_info FROM ottawa where parkid = $1",
    [id]
  );
  return result.rows[0];
};

module.exports = Park;
