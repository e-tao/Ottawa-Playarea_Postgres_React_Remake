const express = require("express");
const router = express.Router();
const DataCache = require("../model/cache");
const Park = require("../model/park");

/* GET all parks. */
router.get("/parks", async function (req, res, next) {
  let results = await DataCache.checkDataAge();
  res.json(results);
});

/* GET a particular park. */
router.get("/parks/:park", async function (req, res, next) {
  let parkId = req.params.park;
  let result = await Park.getParkById(parkId);
  res.json(result);
});

/* UPDATE particular park rating. */

module.exports = router;
