const { send_email } = require("../lib");
const { kafka } = require("./kafka-client");
const { sendMailAndUpdateStatus } = require("./sendMailAndUpdateStatus");

const consumer = kafka.consumer({ groupId: 'notification-group' });

exports.consume = async () => {
  await consumer.connect();
  console.log('[DEBUG] Kafka consumer connected');

  await consumer.subscribe({ topic: 'notifications', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const receivedMessage = JSON.parse(message.value.toString());
      handleNotification(receivedMessage);
    },
  });
}

const handleNotification = async (message) => {
  try {
    switch (message?.method) {
      case 'Email':
        sendMailAndUpdateStatus(message)
        break;
      
      case 'App':
        break;
      
      case 'SMS':
        break;
      default:
        throw new Error()
    }
  }
  catch(err) {
    throw new Error();
  }
}
