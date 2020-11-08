const Sequelize = require("sequelize");
const db = require("../db");

const Show = db.define("show", {
  identifier: {
    type: Sequelize.STRING,
    allowNull: false
  },
  venue: {
    type: Sequelize.STRING
  },
  location: {
    type: Sequelize.STRING
  }
});

module.exports = Show;
