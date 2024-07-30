const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require(path.join(__dirname, '../../serviceAccountKey.json'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const sendPushNotification = async (message) => {
  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return { success: true, message: 'Notification sent!', response };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, message: error.message || 'Error sending notification' };
  }
};

module.exports = { sendPushNotification };
