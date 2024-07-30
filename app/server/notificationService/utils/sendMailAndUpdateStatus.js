const { updateDocument } = require("../helpers")
const { send_email } = require("../lib")

  exports.sendMailAndUpdateStatus = async (payload) => {
    try {
      
        send_email(payload)
        await updateDocument("notifications", {flight_id: payload?.flight_id}, {status: "DELIVERED"})
    }
    catch(err) {
      throw new Error()
    }
  }