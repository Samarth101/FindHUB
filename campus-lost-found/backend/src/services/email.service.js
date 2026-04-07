const nodemailer = require('nodemailer')
const config = require('../config/env')

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.pass
  },
  tls: {
    rejectUnauthorized: false
  }
})

const sendEmail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    html
  })
}

module.exports = { sendEmail }