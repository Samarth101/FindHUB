const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const corsOptions = require('./config/cors');
const { nodeEnv } = require('./config/env');
const router = require('./routes');

const app = express()

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
)
app.use(cors(corsOptions))
app.use(compression())
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))
if (nodeEnv !== 'test') app.use(morgan(nodeEnv === 'development' ? 'dev' : 'combined'))
app.use(router)

module.exports = app