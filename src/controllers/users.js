const User = require('../models/user')
const bcrypt = require('bcrypt')

const getAllUsers = async (req, res) => {
  const users = await User.find({}).select('username email boards')
  res.status(200).json(users)
}
const createUser = async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !password || !email)
    return res.status(400).json({ error: 'username, password and email are required' })
  if (password.length < 3)
    return res.status(400).json({ error: 'password must be at least 3 characters' })
  
  const passwordHash = await bcrypt.hash(password, 10)

  const user = new User({
    username,
    email,
    passwordHash
  })

  const savedUser = await user.save()
  res.status(201).json(savedUser)
}

const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id)
  res.status(204).end()
}

module.exports = {
  getAllUsers,
  createUser,
  deleteUser
}