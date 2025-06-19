const errorHandler = (error, req, res, next) => {
  console.error(error.name, error.message)
  if (error.name === 'CastError')
    return res.status(400).send({ error: 'malformatted id' })
  if (error.name === 'ValidationError')
    return res.status(400).json({ error: error.message })
  if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error'))
    return res.status(400).json({ error: 'expected `username` to be unique' })
  if (error.name ===  'JsonWebTokenError')
    return res.status(401).json({ error: 'invalid token' })
  console.log("CCCCCCCCCC")
  if (error.status){
    console.log("AAAAAAAA")
    return res.status(error.status).json({ error: error.message })
  }

  res.status(500).json({ error: 'internal server error' })
}

module.exports = errorHandler