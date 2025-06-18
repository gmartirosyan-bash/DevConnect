const bcrypt = require('bcrypt')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const login = async (req, res) => {
  const { email, password } = req.body
  if(!email || !password)
    return res.status(400).json({ error: 'email and password are required' })
  const user = await User.findOne({ email })
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if(!user || !passwordCorrect)
    return res.status(401).json({ error: 'invalid email or password' })

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userForToken, process.env.JWT_SECRET)

  res.status(200).send({ token, username: user.username, email: user.email })

}

module.exports = { login }