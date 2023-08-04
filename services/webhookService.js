const axios = require('axios');

const sendWebhookNotification = async (webhookUrl, data) => {
  try {
    await axios.post(webhookUrl, data);
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = sendWebhookNotification;
