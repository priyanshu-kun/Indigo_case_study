const { Kafka } = require('kafkajs')

exports.kafka = new Kafka({
    clientId: 'notifications',
    brokers: ["localhost:9092"],
})

