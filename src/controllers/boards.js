const Board = require('../models/board')
const Column = require('../models/column')
const Card = require('../models/card')

const getFullBoard = async (req, res) => {
  if(!req.user)
    return res.status(401).json({ error: 'persmission denied' })
  const columns = await Column.find({ board: req.params.boardId })
  const cards = await Card.find({ board: req.params.boardId })
  res.status(200).json({columns, cards})
}

const getBoardsByUser = async (req, res) => {
  if(!req.user)
    return res.status(401).json({ error: 'persmission denied' })
  const userId = req.user.id
  const boards = await Board.find({ owner: userId })
  res.status(200).json(boards)
}

const renameBoard = async (req, res) => {
  const { boardId } = req.params
  const { title } = req.body
  
  if(!req.user)
    return res.status(401).json({ error: 'permission denied' })
  if(!title || title.trim() === '')
    return res.status(400).json({ error: 'title is required' })

  const board = await Board.findById(boardId)
  if(!board)
    return res.status(404).json({ error: 'board not found' })

  board.title = title.trim()
  await board.save()

  res.status(201).json(board)
}

const createBoard = async (req, res) => {
  try{ 
    const { title } = req.body
    const user = req.user

    if(!title)
      return res.status(400).json({ error: 'content missing' })
    if(!user)
      return res.status(401).json({ error: 'persmission denied' })

    const board = new Board({
      title,
      owner: user.id
    })
    const savedBoard = await board.save()

    //creating default collumn for new board
    const savedColumn = await Column.create({
      name: 'default',
      board: savedBoard._id
    })
    savedBoard.columns = [savedColumn._id]
    await savedBoard.save()

    user.boards = user.boards.concat(savedBoard._id)
    await user.save()

    res.status(201).json(savedBoard)
  } catch (error) {
  console.error('Error creating board:', error);
  res.status(500).json({ error: 'Internal server error' });
  }
}

const deleteBoard = async (req, res) => {
  const user = req.user
  const { boardId } = req.params
  if(!user)
    return res.status(401).json({ error: 'persmission denied' })
  const board = await Board.findById(boardId)
  if(!board)
    return res.status(404).end()
  if(!board.owner || user.id !== board.owner.toString()){
    return res.status(401).json({ error: 'access denied' })
  }

  user.boards = user.boards.filter(board => board.toString() !== boardId)
  await user.save()
  
  await Column.deleteMany({ board: boardId })

  await Board.findByIdAndDelete(boardId)
  res.status(204).end()
}

module.exports = {
  getFullBoard,
  getBoardsByUser,
  renameBoard,
  createBoard,
  deleteBoard
}