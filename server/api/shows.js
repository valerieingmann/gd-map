const router = require("express").Router();
const { Show } = require("../db/models/index");
const { Client } = require("@googlemaps/google-maps-services-js");
const { Op } = require("sequelize");

const key = process.env.GOOGLE_PLACES_API_KEY;

// Create new shows in the database from archive.org
router.post("/", async (req, res, next) => {
  try {
    const shows = req.body;

    const dbShows = [];
    for (let i = 0; i < shows.length; i++) {
      let show = shows[i];
      let [dbShow] = await Show.findOrCreate({
        where: { identifier: show.identifier }
      });

      await dbShow.update({ venue: show.venue, location: show.location });

      dbShows.push(dbShow);
    }
    res.json(dbShows);
  } catch (error) {
    next(error);
  }
});

// Add geolocation data to shows from Google Places API
router.put("/", async (req, res, next) => {
  try {
    // Shows with "unknown" or "various" will not display on the map
    const shows = await Show.findAll({
      where: {
        [Op.and]: [
          {
            venue: {
              [Op.notILike]: "%unknown%"
            }
          },
          { venue: { [Op.notILike]: "%various%" } },
          { location: { [Op.notILike]: "%unknown%" } }
        ]
      },
      limit: 10
    });

    // Initialize new client from Google Maps
    const client = new Client({});

    for (let i = 0; i < shows.length; i++) {
      let show = shows[i];

      // Remove any "?"
      let query = `${show.venue} ${show.location.replace("?", "")}`;

      let response = await client.textSearch({
        params: {
          query,
          key
        }
      });

      // push location data into show
      let resultArr = response.data.results;
      if (resultArr.length) {
        let latitude =
          resultArr[0].geometry && resultArr[0].geometry.location.lat;
        let longitude =
          resultArr[0].geometry && resultArr[0].geometry.location.lng;

        await show.update({ latitude, longitude });
      }
    }

    res.json("shows updated");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
