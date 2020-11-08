const router = require("express").Router();
const { Show } = require("../db/models");
module.exports = router;

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

// router.put("/:identifier", async (req, res, next) => {
//   try {

//   } catch (error) {
//     next(error)
//   }
// }
// )
