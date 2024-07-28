const mongoose = require("mongoose");
const { DB_USER, DB_PASS, DB_NAME } = require("../");

mongoose.set('strictQuery', true);

mongoose.connect(
  `mongodb://localhost:27017`
);

module.exports = mongoose;
