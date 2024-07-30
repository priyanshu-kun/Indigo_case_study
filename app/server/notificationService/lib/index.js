const sendPushNotification = require("./firebase_cloud_messaging");
const { send_email } = require("./node-mailer");

module.exports =  {
    sendPushNotification,
    send_email
}