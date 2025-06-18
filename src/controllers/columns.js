const Card = require('../models/card')
const Column = require('../models/column')
const assertBoardOwnership = require('../utils/assertBoardOwnership')

const createColumn = async (req, res) => {
  const { name, boardId } = req.body
  const cleanName = name ? name.trim() : null  

  if(!cleanName || !boardId)
    return res.status(400).json({ error: 'content missing, name is required' })
  const board = await assertBoardOwnership(boardId, req.user.id)
  const existingColumn = await Column.findOne({ name: cleanName, board: boardId})
  if(existingColumn)
    return res.status(400).json({ error: 'Column with this name already exists' })

  const column = new Column({
    name: cleanName,
    board: boardId
  })
  const savedColumn = await column.save()
  board.columns = board.columns.concat(savedColumn)
  await board.save()

  res.status(201).json(savedColumn)
}

const renameColumn = async (req, res) => {
  const { columnId } = req.params
  const { name } = req.body
  const cleanName = name ? name.trim() : null  

  if(!cleanName)
    return res.status(400).json({ error: 'name is required' })
  const column = await Column.findById(columnId)
  if(!column)
    return res.status(404).json({ error: 'column not found' })

  const board = await assertBoardOwnership(column.board, req.user.id)
  const existingColumn = await Column.findOne({ name: cleanName, board: board.id })
  if(existingColumn && existingColumn.id.toString() !== columnId)
    return res.status(400).json({ error: 'Column with this name already exists' })

  column.name = cleanName
  await column.save()

  res.status(200).json(column)
}

const deleteColumn = async (req, res) => {
  const column = await Column.findById(req.params.columnId)
  if(!column)
    return res.status(404).json({ error: 'column not found, probably already deleted' })
  const board = await assertBoardOwnership(column.board, req.user.id)

  board.columns = board.columns.filter(col => col.toString() !== req.params.columnId)
  await board.save()
  await Card.deleteMany({ column: column.id })
  await Column.findByIdAndDelete(req.params.columnId)

  res.status(204).end()
}

module.exports = {
  createColumn,
  renameColumn,
  deleteColumn
}