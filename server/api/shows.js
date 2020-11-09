const router = require("express").Router();
const GooglePlaces = require("googleplaces");
const { Show } = require("../db/models/index");
const { Client } = require("@googlemaps/google-maps-services-js");
const { Op } = require("sequelize");

const key = process.env.GOOGLE_PLACES_API_KEY;
const outputFormat = "json";

// const googlePlaces = new GooglePlaces(key, outputFormat);

router.post("/", async (req, res, next) => {
  try {
    const shows = req.body;

    const dbShows = [];
    for (let i = 0; i < shows.length; i++) {
      let [show] = await Show.findOrCreate({
        where: { identifier: shows[i].identifier }
      });

      await show.update({ venue: shows[i].venue, location: shows[i].location });

      dbShows.push(show);
    }
    res.json(dbShows);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    // let venue = "Fillmore Auditorium".split(" ").join("+");
    // let location = "San francisco, CA".split(" ").join("+");
    // const locationNoCommas = location.replace(",", "");

    const shows = await Show.findAll({
      where: {
        [Op.and]: [
          {
            venue: {
              [Op.notILike]: "%unknown%"
            }
          },
          { venue: { [Op.notILike]: "%various%" } }
        ]
      },
      limit: 10
    });
    const client = new Client({});

    const locationData = [];

    for (let i = 0; i < shows.length; i++) {
      let query = shows[i].venue + " " + shows[i].location.replace("?", "");
      let result = await client.textSearch({
        params: {
          query,
          key: key
        }
      });
      locationData.push(result.data.results);
    }

    // console.log(result.data);

    res.json(locationData);

    // client
    //   .elevation({
    //     params: {
    //       locations: [{ lat: 45, lng: -110 }],
    //       key: key
    //     },
    //     timeout: 1000 // milliseconds
    //   })
    //   .then((r) => {
    //     console.log(r.data.results[0].elevation);
    //   })
    //   .catch((e) => {
    //     console.log(e.response.data.error_message);
    //   });

    // console.log(client);
    // googlePlaces.textSearch(parameters, function (error, response) {
    //   if (error) throw error;
    //   console.log(response);
    // });

    // googlePlaces.textSearch(parameters, (error, response) => {
    //   if (error) console.log(error);
    //   else console.log(response);
    // });

    // var textSearch = new TextSearch(config.apiKey, config.outputFormat);

    // const { data } = await axios.get(
    //   `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${venue}+${locationNoCommas}&key=${key}`
    // );

    // console.log(axios);

    // const { data } = await axios.get(url);
  } catch (error) {
    next(error);
  }
});

// router.put("/:identifier", async (req, res, next) => {
//   try {

//   } catch (error) {
//     next(error)
//   }
// }
// )

module.exports = router;
