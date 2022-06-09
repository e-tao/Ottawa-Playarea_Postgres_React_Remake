const pool = require('./db');
const axios = require('axios').default;

let DataCache = {};

DataCache.checkDataAge = async () => {
    let curDate = new Date();
    let lastUpdateDate = await lastUpdate();
    let timeDiff = Math.floor((curDate - lastUpdateDate) / (1000 * 3600 * 24));

    const updateInterval = 30; // define the update interval (in number of days)

    if (timeDiff > updateInterval || lastUpdateDate == null) {
        // await pool.query('DELETE from ottawa'); //delete existing records first

        // problem - once the data is daleted all the existing ratings will be lost as well.
        // need a different data structure or different way to update the database
        // solution: INSERT new record and UPDATE existing records using ON CONFLICT, keep the last update on a seperate table
        // solved;

        
        let updateResult = await updateDb(); //call update function to update the database
        if (updateResult.status === "success") return { "status": "ready" };
    }

    return { "status": "ready" } //otherwise data is still usable, no update needed
}


async function lastUpdate() {
    const result = await pool.query("SELECT last_update FROM update_log ORDER BY last_update desc LIMIT 1"); //sort by last updated date in desc order and get the first result.
    let lastUpdated = result.rows == "" ? null : result.rows[0].last_update;
    return lastUpdated;
}


async function updateDb() {
    const query1 = "https://maps.ottawa.ca/arcgis/rest/services/Parks_Inventory/MapServer/15/query?where=1%3D1&outFields=*&resultOffset=0&resultRecordCount=1000&f=geojson";
    const query2 = "https://maps.ottawa.ca/arcgis/rest/services/Parks_Inventory/MapServer/15/query?where=1%3D1&outFields=*&resultOffset=1000&resultRecordCount=2000&f=geojson";

    queryResult1 = (await axios.get(query1)).data.features;
    queryResult2 = (await axios.get(query2)).data.features;

    results = [...queryResult1, ...queryResult2];
    let today = new Date();
    // console.log(today)

        try {
            results.forEach(async (park) =>{
                let result = await pool.query ('INSERT INTO ottawa (parkid, park_info) VALUES ($1, $2) ON CONFLICT (parkid) DO NOTHING', [JSON.stringify(park.id), JSON.stringify(park)]);
            });

            await pool.query('INSERT INTO update_log (last_update) VALUES ($1)', [today])
            return { "status": "success" };
        }
        catch (err) {
            console.log(err);
            return { "status": "failed" };
        }
}

module.exports = DataCache;
