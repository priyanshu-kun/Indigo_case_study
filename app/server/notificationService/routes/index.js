const express = require("express");
const router = express.Router();
const SendNotification = require("../controllers/send-notification");
const flattenObject = require("../utils/flattenObj");
const transformFlightObject = require("../utils/flattenObj");

const notificationService = new SendNotification();

// ROUTES * /api/send-notification/
router.post('/send-notification', async (req, res) => {
  try {
    const payload = req.body;
    const flattened = transformFlightObject(payload)
    const result = await notificationService.notificationProducer(flattened);
    if (!result.success) {
      throw new Error()
    }
    res.status(200).json({});
  } catch (err) {
    res.status(500).json({ "error": "I don't have enough time left to handle erors gracefully!" });
  }
});



const userTokens = []

router.post('/save-token', (req, res) => {
  const { token } = req.body;

  if (token) {
    userTokens.push(token);
    console.log('Token received and saved:', token);
    res.status(200).send({ success: true, message: 'Token saved successfully' });
  } else {
    res.status(400).send({ success: false, message: 'Token is required' });
  }
});


module.exports = router;
