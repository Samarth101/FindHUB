const { sendEmail } = require('./email.service')
const templates = require('./emailTemplates')

const sendClaimResult = async ({ user, item, isMatch, finder }) => {
  if (isMatch) {
    return sendEmail({
      to: user.email,
      subject: 'Match Found for Your Lost Item',
      html: templates.claimMatchFound(user.name, item.itemName, finder)
    })
  } else {
    return sendEmail({
      to: user.email,
      subject: 'No Match Found',
      html: templates.claimNoMatch(user.name, item.itemName)
    })
  }
}

module.exports = { sendClaimResult }