const express = require('express')
const app = express()
const cors = require('cors')
require('express-async-errors')
const middleware = require('./middlewares/index')
const mongoose = require('mongoose')
const path = require('path')

const usersRouter = require('./routes/users')
const boardsRouter = require('./routes/boards')
const columnsRouter = require('./routes/columns')
const cardsRouter = require('./routes/cards')
const loginRouter = require('./routes/login')
require('dotenv').config();

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
app.use('/api/boards', middleware.tokenExtractor, middleware.userExtractor, boardsRouter)
app.use('/api/columns', middleware.tokenExtractor, middleware.userExtractor, columnsRouter)
app.use('/api/cards', middleware.tokenExtractor, middleware.userExtractor, cardsRouter)
app.use('/api/login', loginRouter)

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
})

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app