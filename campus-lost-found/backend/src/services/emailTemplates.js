const claimNoMatch = (name, item) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #d9534f;">Claim Review Update</h2>

    <p>Dear ${name},</p>

    <p>
      Thank you for submitting a claim for <strong>${item}</strong>.
      After careful review, we were unable to find a matching item at this time.
    </p>

    <p>
      This may happen if the available details are insufficient or no corresponding item has been reported yet.
      You may submit another claim with additional identifying information if available.
    </p>

    <p>
      Our team will continue monitoring for potential matches.
    </p>

    <br/>

    <p>Regards,<br/>FindHUB Team</p>
  </div>
`

const claimMatchFound = (name, item, finder) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #28a745;">Match Found</h2>

    <p>Dear ${name},</p>

    <p>
      We are pleased to inform you that a potential match has been identified for your lost item:
      <strong>${item}</strong>.
    </p>

    ${
      finder
        ? `
    <h3>Finder Details</h3>
    <p><strong>Name:</strong> ${finder.name}</p>
    <p><strong>Email:</strong> ${finder.email}</p>

    <p>
      You may contact the finder directly to coordinate the next steps for retrieval.
    </p>
    `
        : `
    <p>
      The finder has chosen to remain anonymous. Please use the platform to proceed further.
    </p>
    `
    }

    <br/>

    <p>Regards,<br/>FindHUB Team</p>
  </div>
`

module.exports = {
  claimNoMatch,
  claimMatchFound
}