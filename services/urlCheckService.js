const axios = require('axios');
const UrlCheck = require('../models/UrlCheck');
const UrlCheckHistory = require('../models/UrlCheckHistory');
const User = require('../models/User');
const sendEmail = require('./emailService');
const sendWebhookNotification = require('./webhookService');

const urlChecks = {};

const startUrlCheck = async (urlCheck) => {
  const { _id, url, interval } = urlCheck;

  const checkUrl = async () => {
    try {
      const start = Date.now();
      const response = await axios.get(url);
      const responseTime = Date.now() - start;

      const status = response.status >= 200 && response.status < 300 ? 'UP' : 'DOWN';

      const urlCheckHistory = new UrlCheckHistory({
        urlCheck: _id,
        status,
        responseTime
      });

      await urlCheckHistory.save();

      const user = await User.findById(urlCheck.user);

      if (urlCheck.status !== status) {
        if (user.notificationPreferences.email) {
          sendEmail(user.email, `URL Check ${status}`, `The URL check for ${url} is now ${status}.`);
        }

        if (user.notificationPreferences.webhook && user.webhookUrl) {
          sendWebhookNotification(user.webhookUrl, { url, status });
        }
      }

      urlCheck.status = status;
      urlCheck.lastChecked = Date.now();

      await urlCheck.save();
    } catch (err) {
      console.error(err.message);
    }
  };

  checkUrl();

  urlChecks[_id] = setInterval(checkUrl, interval * 1000);
};

const stopUrlCheck = (urlCheck) => {
  clearInterval(urlChecks[urlCheck._id]);
  delete urlChecks[urlCheck._id];
};

const updateUrlCheck = (urlCheck) => {
  stopUrlCheck(urlCheck);
  startUrlCheck(urlCheck);
};

module.exports = { startUrlCheck, stopUrlCheck, updateUrlCheck };
