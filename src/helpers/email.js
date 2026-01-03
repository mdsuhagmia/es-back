const nodemailer = require("nodemailer");
const { smtpUsername, smtpPassword } = require("../secret");
const logger = require("../controller/loggerController");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: smtpUsername,
    pass: smtpPassword,
  },
});

const emailWithNodeMailer = async (emailData) => {
  try {
    const emailOptions = {
      from: smtpUsername,
      to: emailData.email,
      subject: emailData.subject,
      html: emailData.html,
    }
    const info = await transporter.sendMail(emailOptions);
    logger.info("Message sent: %s", info.response);
  } catch (error) {
    logger.error("Error while sending mail", error);
    throw error;
  }
};

module.exports = emailWithNodeMailer;
