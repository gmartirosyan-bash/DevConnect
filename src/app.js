const express = require('express')
const app = express()
const cors = require('cors')
require('express-async-errors')
const middleware = require('./middlewares/index')
const mongoose = require('mongoose')
const path = require('path')
const setupGraphQL = require('./graphql/server')

require('dotenv').config();

const usersRouter = require('./routes/users')
const boardsRouter = require('./routes/boards')
const columnsRouter = require('./routes/columns')
const cardsRouter = require('./routes/cards')
const loginRouter = require('./routes/login')

mongoose.connect(process.env.MONGO_DB)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log(`check your passowrd ${error.name}`)
    process.exit(1)
  })

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

app.use('/api/users', usersRouter)
app.use('/api/boards', boardsRouter)
app.use('/api/columns', columnsRouter)
app.use('/api/cards', cardsRouter)
app.use('/api/login', loginRouter)

async function startServer() {
  await setupGraphQL(app);
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'dist', 'index.html'))
  })
  
  app.use(middleware.unknownEndpoint)
  app.use(middleware.errorHandler)
}
startServer()

module.exports = app