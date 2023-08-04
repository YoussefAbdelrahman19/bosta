const nodemailer = require('nodemailer');
const config = require('config');

const sendEmail = async (to, subject, text) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.get('email'),
      pass: config.get('emailPassword')
    }
  });

  let mailOptions = {
    from: config.get('email'),
    to,
    subject,
    text
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = sendEmail;
