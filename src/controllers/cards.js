const Card = require('../models/card')
const Column = require('../models/column')
const Board = require('../models/board')

const createCard = async (req, res) => {
  if(!req.user)
    return res.status(401).json({error: 'permission denied'})
  const { title, columnId } = req.body
  if(!title || !columnId)
    return res.status(400).json({ error: 'content missing'})
  const column = await Column.findById(columnId)
  const board = await Board.findById(column.board)
  if(req.user.id !== board.owner.toString())
    return res.status(403).json({ error: 'access denied '})
  const card = new Card({
    title,
    owner: board.owner,
    board: board.id,
    column: columnId
  })
  const savedCard = await card.save()
  column.cards = column.cards.concat(savedCard)
  await column.save()

  res.status(201).json(savedCard)
}

const dragCard = async (req, res) => {
  if(!req.user)
    return res.status(401).json({error: 'permission denied'})
  const { columnId } = req.body
  const { cardId } = req.params
  if(!columnId)
    return res.status(400).json({ error: 'content missing'})
  const card = await Card.findById(cardId)
  if(!card)
    return res.status(404).json({ error: 'card not found' })
  const oldColumn = await Column.findById(card.column)
  const newColumn = await Column.findById(columnId)
  if(!oldColumn || !newColumn)
    return res.status(400).json({ error: 'column not found' })
  oldColumn.cards = oldColumn.cards.filter(id => id.toString() !== card.id)
  await oldColumn.save()
  card.column = newColumn.id
  const savedCard = await card.save()
  newColumn.cards = newColumn.cards.concat(savedCard)
  await newColumn.save()
  res.status(201).json(savedCard)
}

const deleteCard = async (req, res) => {
  if(!req.user)
    return res.status(401).json({error: 'permission denied'})
  const { cardId } = req.params
  const card = await Card.findById(cardId)
  if(!card)
    return res.status(404).json({error: 'card not found'})
  if(req.user.id !== card.owner.toString())
    return res.status(403).json({ error: 'access denied' })
  const column = await Column.findById(card.column)
  if(!column)
    return res.status(400).json({ error: 'column not found' })
  column.cards = column.cards.filter(id => id.toString() !== cardId)
  await column.save()
  await Card.findByIdAndDelete(cardId)
  res.status(204).end()
}

module.exports = { createCard, deleteCard, dragCard }