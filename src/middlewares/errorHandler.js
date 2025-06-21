const errorHandler = (error, req, res, next) => {
  console.error(error.name, error.message, error)
  if (error.name === 'CastError')
    return res.status(400).send({ error: 'malformatted id' })
  if (error.name === 'ValidationError'){
    if(error.message.includes('username') && error.message.includes('shorter'))
      return res.status(400).json({ error: 'Username must be at least 3 characters long' })
  }
  if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')){
    if(error.message.includes('email'))
      return res.status(400).json({ error: 'Email is already in use' })
    if(error.message.includes('username'))
      return res.status(400).json({ error: 'Username is already in use' })
  }
  if (error.name ===  'JsonWebTokenError')
    return res.status(401).json({ error: 'invalid token' })
  if (error.status){
    return res.status(error.status).json({ error: error.message })
  }
  res.status(500).json({ error: 'internal server error' })
}

module.exports = errorHandler