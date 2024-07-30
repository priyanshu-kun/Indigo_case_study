const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.notifications = require("./notification-type/index");

module.exports = db;
