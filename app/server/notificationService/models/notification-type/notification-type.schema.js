const mongoose = require("mongoose");
const schemaType = require("../../types");

const notificationSchema = new mongoose.Schema({
  flight_id: {
    type: schemaType.TypeString,
    required: true
  },
  status: {
    type: schemaType.TypeString,
    required: true,
    default: "PENDING"
  },
  _retry: {
    type: schemaType.TypeNumber,
    required: true,
    default: 0
  },
  message: {
    type: schemaType.TypeString,
    required: true
  },
  timestamp: {
    type: schemaType.TypeDate,
    required: true
  },
  method: {
    type: schemaType.TypeString,
    enum: ['SMS', 'Email', 'App'], // Assuming these are possible methods
    required: true
  },
  recipient: {
    type: schemaType.TypeString,
    required: true
  }
}, {timestamps: true});


module.exports = notificationSchema;
