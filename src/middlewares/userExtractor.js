const jwt = require('jsonwebtoken')
const User = require('../models/user')
require('dotenv').config()

const userExtractor = async (req, res, next) => {
  if(req.token === null) {
    req.user = null
  }else{
    const decodedToken = jwt.verify(req.token, process.env.JWT_SECRET)
    if(!decodedToken.id){
      return res.status(401).json({ error: 'invalid token' })
    }
    const user = await User.findById(decodedToken.id)
    if(user === null){
      return res.status(404).json({ error: 'user not found' })
    }
    req.user = user
  }
  next()
}

module.exports = userExtractor