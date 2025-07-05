const assertBoardOwnership = require('../utils/assertBoardOwnership')
const Board = require('../models/board')
const Column = require('../models/column')
const Card = require('../models/card')

const getBoards = async (req, res) => {
  const boards = await Board.find({})
  res.status(200).json(boards)
}

const getFullBoard = async (req, res) => {
  const { boardId } = req.params

  await assertBoardOwnership(boardId, req.user.id)
  const columns = await Column.find({ board: boardId })
  const cards = await Card.find({ board: boardId })
  res.status(200).json({columns, cards})
}

const getBoardsByUser = async (req, res) => {
  const boards = await Board.find({ owner: req.user.id })
  res.status(200).json(boards)
}

const renameBoard = async (req, res) => {
  const { boardId } = req.params
  const { name } = req.body
  const newName = name ? name.trim() : null  

  if(!newName)
    return res.status(400).json({ error: 'name is required' })
  const board = await assertBoardOwnership(boardId, req.user.id)

  board.name = newName
  await board.save()

  res.status(200).json(board)
}

const createBoard = async (req, res) => {
  const { name } = req.body
  const user = req.user
  const newName = name ? name.trim() : null  

  if(!newName)
    return res.status(400).json({ error: 'content missing' })

  const board = new Board({
    name: newName,
    owner: user.id
  })
  const savedBoard = await board.save()
  user.boards = user.boards.concat(savedBoard._id)
  await user.save()

  const defaultColumns = [
    { name: 'To Do', board: board._id },
    { name: 'Doing', board: board._id },
    { name: 'Done', board: board._id }
  ]
  const savedColumns = await Column.insertMany(defaultColumns)
  savedBoard.columns = savedColumns.map(col => col._id)
  await savedBoard.save()

  const populatedBoard = await Board.findById(savedBoard._id).populate('columns')
  res.status(201).json(populatedBoard)
}

const deleteBoard = async (req, res) => {
  const user = req.user
  const { boardId } = req.params
  await assertBoardOwnership(boardId, user.id)

  user.boards = user.boards.filter(board => board.toString() !== boardId)
  await user.save()
  
  await Promise.all([
    Card.deleteMany({ board: boardId }),
    Column.deleteMany({ board: boardId }),
    Board.findByIdAndDelete(boardId)
  ])
  res.status(204).end()
}

module.exports = {
  getBoards,
  getFullBoard,
  getBoardsByUser,
  renameBoard,
  createBoard,
  deleteBoard
}