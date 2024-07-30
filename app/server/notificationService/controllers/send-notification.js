const { insertNewDocument } = require("../helpers");
const producer = require("../utils/producer");

class SendNotification {
  constructor() {
    this.apiUrl = process.env.BASE_FAKE_AVATION_API_URL;
  }

  async savePendingStateOfNotifications(payload) {
    await insertNewDocument("notifications", payload)
  }

  handleSetNotificationReason(payload) {
    if (!payload?.reason) {
      console.log("[ERROR] Bad Request, Reason not specified!")
      throw new Error();
    }
    switch (payload?.reason) {
      case 'cancelled':
        return `Your flight ${payload?.flight_id} is Cancelled.`
      case 'delayed':
        return `Your flight ${payload?.flight_id} is Delayed. New departure time: ${payload?.scheduled_departure}. Departure gate: ${payload?.departure_gate}.`
      case 'on_time':
        return `Your flight ${payload?.flight_id} is On Time. New departure time: ${payload?.scheduled_departure}. Departure gate: ${payload?.departure_gate}.`
      case 'gate_changed':
        return `Your flight ${payload?.flight_id} is changed the Departure Gate. New departure gate: ${payload?.departure_gate}.`
      default:
        throw new Error()
    }
  }

  async produceNotification(payload) {
    console.log(payload)
    try {
      await producer.send({
        topic: 'notifications',
        messages: [
          { value: JSON.stringify(payload) },
        ],
      });
    }
    catch (err) {
      throw new Error()
    }

  }

  /**
   * recipient: <String>
     timestamp: <Date>
     flight_id: <String>
     reason: <String>
     departure_gate: <String>
     arrival_gate: <String>
     scheduled_departure: <Date>
     scheduled_arrival: <Date>
   */

  async notificationProducer(payload) {
    try {
      const newPayload = {
        ...payload,
        message: this.handleSetNotificationReason(payload)
      }
      this.savePendingStateOfNotifications(newPayload)

      this.produceNotification(newPayload)


      return { success: true, message: 'Notification sent!', newPayload };
    }
    catch (err) {
      return { success: false, message: err };
    }
  }
}

module.exports = SendNotification;
