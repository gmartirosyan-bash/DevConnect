const Column = require('../models/column')
const Board = require('../models/board')

const createColumn = async (req, res) => {
  const user = req.user
  const body = req.body
  if(!user)
    return res.status(401).json({ error: 'permission denied' })
  if(!body.name || !body.boardId)
    return res.status(400).json({ error: 'content missing' })
  const column = new Column({
    name: body.name,
    board: body.boardId
  })
  const savedColumn = await column.save()
  const board = await Board.findById(body.boardId)
  board.columns = board.columns.concat(savedColumn)
  await board.save()

  res.status(201).json(savedColumn)
}

const renameColumn = async (req, res) => {
  const { columnId } = req.params
  const { name } = req.body
  
  if(!req.user)
    return res.status(401).json({ error: 'permission denied' })
  if(!name || name.trim() === '')
    return res.status(400).json({ error: 'name is required' })

  const column = await Column.findById(columnId)
  if(!column)
    return res.status(404).json({ error: 'column not found' })

  column.name = name.trim()
  await column.save()

  res.status(201).json(column)
}

const deleteColumn = async (req, res) => {
  if(!req.user)
    return res.status(401).json({ error: 'permission denied' })
  const column = await Column.findById(req.params.columnId)
  if(!column)
    return res.status(404).json({ error: 'column not found, probably already deleted' })
  const board = await Board.findById(column.board)
  if(board.owner.toString() !== req.user.id)
    return res.status(401).json({ error: 'access denied' })
  if(board.columns.length <= 1)
    return res.status(400).json({ message: "Board must have at least one column"})

  board.columns = board.columns.filter(col => col.toString() !== req.params.columnId)
  await board.save()
  await Column.findByIdAndDelete(req.params.columnId)

  res.status(204).end()
}

module.exports = {
  createColumn,
  renameColumn,
  deleteColumn
}