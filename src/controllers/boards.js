const assertBoardOwnership = require('../utils/assertBoardOwnership')
const Board = require('../models/board')
const Column = require('../models/column')
const Card = require('../models/card')

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
  const { title } = req.body
  const newTitle = title ? title.trim() : null  

  if(!newTitle)
    return res.status(400).json({ error: 'title is required' })
  const board = await assertBoardOwnership(boardId, req.user.id)

  board.title = newTitle
  await board.save()

  res.status(200).json(board)
}

const createBoard = async (req, res) => {
  const { title } = req.body
  const user = req.user
  const newTitle = title ? title.trim() : null  

  if(!newTitle)
    return res.status(400).json({ error: 'content missing' })

  const board = new Board({
    title: newTitle,
    owner: user.id
  })
  const savedBoard = await board.save()
  user.boards = user.boards.concat(savedBoard._id)
  await user.save()

  res.status(201).json(savedBoard)
}

const deleteBoard = async (req, res) => {
  const user = req.user
  const { boardId } = req.params
  await assertBoardOwnership(boardId, user.id)

  user.boards = user.boards.filter(board => board.toString() !== boardId)
  await user.save()
  
  await Promise.all([
    Column.deleteMany({ board: boardId }),
    Card.deleteMany({ board: boardId }),
    Board.findByIdAndDelete(boardId)
  ])
  res.status(204).end()
}

module.exports = {
  getFullBoard,
  getBoardsByUser,
  renameBoard,
  createBoard,
  deleteBoard
}