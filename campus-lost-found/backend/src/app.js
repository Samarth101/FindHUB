const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const compression = require('compression');
const morgan     = require('morgan');

const corsOptions = require('./config/cors');
const { nodeEnv } = require('./config/env');
const { general } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Route imports
const authRoutes         = require('./routes/auth.routes');
const lostRoutes         = require('./routes/lost.routes');
const foundRoutes        = require('./routes/found.routes');
const matchRoutes        = require('./routes/match.routes');
const claimRoutes        = require('./routes/claim.routes');
const communityRoutes    = require('./routes/community.routes');
const chatRoutes         = require('./routes/chat.routes');
const notifRoutes        = require('./routes/notification.routes');
const handoverRoutes     = require('./routes/handover.routes');
const adminRoutes        = require('./routes/admin.routes');

const app = express();

/* ── Security & utilities ───────────────────────────────────────────── */
app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));   // Preflight
app.use(compression());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

if (nodeEnv !== 'test') {
  app.use(morgan(nodeEnv === 'development' ? 'dev' : 'combined'));
}

/* ── General rate limit ─────────────────────────────────────────────── */
app.use('/api', general);

/* ── Health check ───────────────────────────────────────────────────── */
app.get('/health', (req, res) => res.json({ status: 'ok', env: nodeEnv }));

/* ── API Routes ─────────────────────────────────────────────────────── */
app.use('/api/auth',          authRoutes);
app.use('/api/lost',          lostRoutes);
app.use('/api/found',         foundRoutes);
app.use('/api/matches',       matchRoutes);
app.use('/api/claims',        claimRoutes);
app.use('/api/community',     communityRoutes);
app.use('/api/chat',          chatRoutes);
app.use('/api/notifications', notifRoutes);
app.use('/api/handovers',     handoverRoutes);
app.use('/api/admin',         adminRoutes);

/* ── 404 & error handling ───────────────────────────────────────────── */
app.use(notFound);
app.use(errorHandler);

module.exports = app;
