const User = require('../models/user')
const Board = require('../models/board')
const Column = require('../models/column')
const Card = require('../models/card')
const bcrypt = require('bcrypt')

const getUsers = async (req, res) => {
  const users = await User.find({})
  res.status(200).json(users)
}

const editUser = async (req, res) => {
  const { username, email } = req.body
  if(!username && !email)
    return res.status(400).json({ error: 'content is missing' })
  const user = await User.findById(req.params.userId)
  if(!user)
    return res.status(404).json({ error: 'User not found' })
  if(req.params.userId !== req.user.id)
    return res.status(403).json({ error: 'This is not your profile' })

  if(username) user.username = username
  if(email) user.email = email
  
  const updatedUser = await user.save()
  res.status(200).json(updatedUser)
}

const createUser = async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !password || !email)
    return res.status(400).json({ error: 'username, password and email are required' })
  if (password.length < 3)
    return res.status(400).json({ error: 'Password must be at least 3 characters long' })
  
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
  const { userId } = req.params
  const user = await User.findById(userId)
  if(!user)
    return res.status(404).json({ error: 'User not found'})
  if(userId !== req.user.id)
    return res.status(403).json({ error : 'This is not your profile'})
  const boards = await Board.find({ owner: userId })
  const boardIds = boards.map(b => b.id)

  await Promise.all([
    Card.deleteMany({ owner: userId }),
    Column.deleteMany({ board: { $in: boardIds } }),
    Board.deleteMany({ owner: userId }),
    User.findByIdAndDelete(userId)
  ])
  res.status(204).end()
}

module.exports = {
  getUsers,
  createUser,
  editUser,
  deleteUser
}