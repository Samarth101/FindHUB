const { body } = require('express-validator')

const createLostReportValidator = [
  body('category').notEmpty(),
  body('itemName').notEmpty(),
  body('location').notEmpty(),
  body('date').notEmpty(),
  body('locationCoords').exists(),
  body('locationCoords.lat').isFloat({ min: -90, max: 90 }),
  body('locationCoords.lng').isFloat({ min: -180, max: 180 })
]

module.exports = {
  createLostReportValidator
}