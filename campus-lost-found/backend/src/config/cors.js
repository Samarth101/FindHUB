const { clientUrl, nodeEnv } = require('./env');

const whitelist = [
  clientUrl,
  'https://findhub.samarthdev.me',
  'https://www.findhub.samarthdev.me',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, etc) or if explicitly in whitelist
    if (!origin || whitelist.includes(origin) || nodeEnv === 'development') {
      return callback(null, true);
    }
    
    // Also allow any subdomain of samarthdev.me for flexibility
    if (origin.endsWith('.samarthdev.me')) {
      return callback(null, true);
    }

    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 600,
};

module.exports = corsOptions;
