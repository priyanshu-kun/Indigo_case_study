const mongoose = require("mongoose");

mongoose.set('strictQuery', true);

mongoose.connect(
  `mongodb://localhost:27017/aviation_db`
);

module.exports = mongoose;
