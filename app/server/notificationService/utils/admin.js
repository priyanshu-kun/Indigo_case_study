const { kafka } = require('./kafka-client');

exports.init = async () => {
    const admin = kafka.admin();
    console.log("[DEBUG] Admin is connecting...")
    admin.connect()
    console.log("[DEBUG] Admin is connected successfully...")
    await admin.createTopics({
        topics: [
            {
                topic: 'notifications',
                numPartitions: 1
            }
        ]
    })

    console.log("[DEBUG] Topic created successfully...")
    await admin.disconnect()
    console.log("[DEBUG] Admin disconnected...")
}

