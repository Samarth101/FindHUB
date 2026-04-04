require('dotenv').config();

module.exports = {
  port:      process.env.PORT || 5000,
  nodeEnv:   process.env.NODE_ENV || 'development',
  mongoUri:  process.env.MONGO_URI || 'mongodb://localhost:27017/campus-lost-found',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_CHANGE_ME',
  jwtExpiry: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey:    process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  email: {
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT) || 587,
    user:   process.env.SMTP_USER,
    pass:   process.env.SMTP_PASS,
    from:   process.env.MAIL_FROM || 'FindHUB <noreply@findhub.campus>',
  },
  rateLimits: {
    general: Number(process.env.RATE_LIMIT_GENERAL) || 100,
    auth:    Number(process.env.RATE_LIMIT_AUTH)    || 10,
    report:  Number(process.env.RATE_LIMIT_REPORT)  || 5,
    verify:  Number(process.env.RATE_LIMIT_VERIFY)  || 3,
  },
};
