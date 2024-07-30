const mongoose = require("mongoose");
const notificationSchema = require("./notification-type.schema");

const notificationType = mongoose.model("notifications", notificationSchema);

module.exports = notificationType;
