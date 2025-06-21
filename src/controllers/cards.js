const Card = require('../models/card')
const Column = require('../models/column')
const assertBoardOwnership = require('../utils/assertBoardOwnership')

const getCards = async (req, res) => {
  const cards = await Card.find({})
  res.status(200).json(cards)
}

const createCard = async (req, res) => {
  const { title, columnId } = req.body
  const cleanTitle = title ? title.trim() : null  

  if(!cleanTitle || !columnId)
    return res.status(400).json({ error: 'content missing'})
  const column = await Column.findById(columnId)
  if (!column)
    return res.status(400).json({ error: 'column not found' })
  const board = await assertBoardOwnership(column.board, req.user.id)

  const card = new Card({
    title: cleanTitle,
    owner: board.owner,
    board: board.id,
    column: columnId
  })
  const savedCard = await card.save()
  column.cards = column.cards.concat(savedCard)
  await column.save()

  res.status(201).json(savedCard)
}

const renameCard = async (req, res) => {
  const { cardId } = req.params
  const { title } = req.body
  const cleanTitle = title ? title.trim() : null  

  if(!cleanTitle)
    return res.status(400).json({ error: 'title is required' })
  const card = await Card.findById(cardId)
  if(!card)
    return res.status(404).json({ error: 'card not found' })

  await assertBoardOwnership(card.board, req.user.id)

  card.title = cleanTitle
  await card.save()

  res.status(200).json(card)
}

const dragCard = async (req, res) => {
  const { columnId } = req.body
  const { cardId } = req.params

  if (!columnId) 
    return res.status(400).json({ error: 'columnId missing' })

  const card = await Card.findById(cardId)
  if (!card) return res.status(404).json({ error: 'card not found' })

  const oldColumn = await Column.findById(card.column)
  const newColumn = await Column.findById(columnId)
  if (!oldColumn || !newColumn)
    return res.status(400).json({ error: 'column not found' })

  oldColumn.cards = oldColumn.cards.filter(id => id.toString() !== cardId)
  newColumn.cards.push(card._id)

  await oldColumn.save()
  await newColumn.save()

  card.column = newColumn._id
  await card.save()

  res.status(200).json(card)
}


const deleteCard = async (req, res) => {
  const { cardId } = req.params
  const card = await Card.findById(cardId)
  if(!card)
    return res.status(404).json({error: 'card not found'})
  if(req.user.id !== card.owner.toString())
    return res.status(403).json({ error: 'You do not own this card' })
  const column = await Column.findById(card.column)
  if(!column)
    return res.status(400).json({ error: 'column not found' })
  column.cards = column.cards.filter(id => id.toString() !== cardId)
  await column.save()
  await Card.findByIdAndDelete(cardId)
  res.status(204).end()
}

module.exports = {
  getCards,
  createCard,
  renameCard,
  deleteCard,
  dragCard
}