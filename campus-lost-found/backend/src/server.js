require('dotenv').config()

const app = require('./app')
const { connectDB } = require('./config/db')
const { initSocket } = require('./config/socket')
const { port } = require('./config/env')

async function bootstrap() {
  const server = app.listen(port, () => {
    console.log(`http://localhost:${port}`)
  })

  initSocket(server)

  connectDB().catch((err) => {
    console.error('[DB]', err.message)
  })

  const shutdown = (signal) => {
    console.log(`[${signal}] shutting down`)
    server.close(() => process.exit(0))
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('uncaughtException', (err) => {
    console.error('[UNCAUGHT]', err)
    process.exit(1)
  })
  process.on('unhandledRejection', (err) => {
    console.error('[UNHANDLED]', err)
  })
}

bootstrap().catch((err) => {
  console.error('[BOOT]', err.message)
  process.exit(1)
})