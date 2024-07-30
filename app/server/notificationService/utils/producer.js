const { kafka } = require("./kafka-client");


const producer = kafka.producer();

const connectProducer = async () => {
  await producer.connect();
  console.log('[DEBUG] Kafka producer connected');
}

connectProducer().catch(console.error);

module.exports = producer;