const nodemailer = require('nodemailer');
const { email: emailConfig, clientUrl } = require('../config/env');

const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.port === 465,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
});

// Verify connection on startup
transporter.verify((error) => {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to take our messages');
  }
});

/**
 * Generic send mail function
 */
async function sendMail({ to, subject, text, html }) {
  try {
    const info = await transporter.sendMail({
      from: emailConfig.from,
      to,
      subject,
      text,
      html,
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
}

/**
 * Specific templates
 */

async function sendWelcomeEmail(user) {
  const subject = 'Welcome to FindHUB! 🛡️';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #4f46e5;">Welcome to FindHUB, ${user.name}!</h2>
      <p>We're excited to have you join our smart campus community. FindHUB helps you recover lost items and return found ones with ease.</p>
      <p><strong>What can you do now?</strong></p>
      <ul>
        <li>Report a lost item</li>
        <li>Browse found items</li>
        <li>Earn trust points by returning items</li>
      </ul>
      <p>If you have any questions, feel free to reply to this email.</p>
      <br>
      <p>Best regards,<br>The FindHUB Team</p>
    </div>
  `;
  return sendMail({ to: user.email, subject, html, text: `Welcome to FindHUB, ${user.name}!` });
}

async function sendLostReportConfirmation(user, report) {
  const subject = `Lost Report Confirmed: ${report.itemName}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #4f46e5;">Lost Report Received</h2>
      <p>Hi ${user.name}, we've successfully recorded your lost report for <strong>"${report.itemName}"</strong>.</p>
      <p>Our AI is now scanning all found items to find a match. We will notify you the moment something looks similar!</p>
      <div style="background: #f9fafb; padding: 15px; border-radius: 5px;">
        <p><strong>Category:</strong> ${report.category}</p>
        <p><strong>Location:</strong> ${report.location}</p>
        <p><strong>Date:</strong> ${new Date(report.dateLost).toLocaleDateString()}</p>
      </div>
      <p>Stay hopeful! We are searching.</p>
      <br>
      <p>Best regards,<br>FindHUB Team</p>
    </div>
  `;
  return sendMail({ to: user.email, subject, html, text: `Lost report for ${report.itemName} confirmed.` });
}

async function sendFoundItemThankYou(user, item) {
  const subject = `Thank You for Finding: ${item.itemName}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #059669;">You're a Campus Hero! 🌟</h2>
      <p>Hi ${user.name}, thank you so much for reporting the found item: <strong>"${item.itemName}"</strong>.</p>
      <p>Honest actions like yours make our campus a better place. We are currently matching this with reported lost items.</p>
      <p>If a match is confirmed, we will coordinate a safe handover.</p>
      <br>
      <p>Warm regards,<br>FindHUB Team</p>
    </div>
  `;
  return sendMail({ to: user.email, subject, html, text: `Thank you for reporting the found item: ${item.itemName}.` });
}

async function sendClaimUpdate(user, claim, status) {
  const isApproved = status === 'approved';
  const subject = isApproved ? '🎉 Your Claim has been Approved!' : 'Update regarding your Claim';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: ${isApproved ? '#059669' : '#dc2626'};">${isApproved ? 'Claim Approved!' : 'Claim Update'}</h2>
      <p>Hi ${user.name},</p>
      <p>${isApproved 
        ? `Great news! Your ownership of the item has been verified. You can now proceed to the next steps for handover.` 
        : `Unfortunately, your claim for the item could not be verified at this time. Please contact the campus admin for more details.`}</p>
      ${isApproved ? '<p>Please check your FindHUB notifications for handover coordinates.</p>' : ''}
      <br>
      <p>Best regards,<br>FindHUB Team</p>
    </div>
  `;
  return sendMail({ to: user.email, subject, html, text: `Your claim status has been updated to ${status}.` });
}

async function sendMatchNotification(user, reportName) {
  const subject = `🎯 Possible Match Found for your ${reportName}!`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #4f46e5;">We found something!</h2>
      <p>Hi ${user.name},</p>
      <p>Our AI has identified a found item that closely matches your lost report for **${reportName}**.</p>
      <p>Please log in to FindHUB to verify the item and submit a claim if it belongs to you.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${clientUrl}/dashboard" style="background: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Check Match Now</a>
      </div>
      <br>
      <p>Best regards,<br>FindHUB Team</p>
    </div>
  `;
  return sendMail({ to: user.email, subject, html, text: `A possible match for your ${reportName} has been found!` });
}

async function sendChatMessageNotification(user, senderName, roomName) {
  const subject = `New Message from ${senderName} on FindHUB`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #4f46e5;">You have a new message! 💬</h2>
      <p>Hi ${user.name},</p>
      <p><strong>${senderName}</strong> sent you a new message in the chat for <strong>"${roomName}"</strong>.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${clientUrl}/dashboard" style="background: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Message</a>
      </div>
      <br>
      <p>Best regards,<br>FindHUB Team</p>
    </div>
  `;
  return sendMail({ to: user.email, subject, html, text: `You have a new message from ${senderName}.` });
}

module.exports = {
  sendWelcomeEmail,
  sendLostReportConfirmation,
  sendFoundItemThankYou,
  sendClaimUpdate,
  sendMatchNotification,
  sendChatMessageNotification,
};
