const User = require('../models/user')
const bcrypt = require('bcrypt')

const getAllUsers = async (req, res) => {
  const users = await User.find({})
  res.status(200).json(users)
}
const createUser = async (req, res) => {
  const { username, email, password } = req.body
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