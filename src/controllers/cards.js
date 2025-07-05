const Card = require('../models/card')
const Column = require('../models/column')
const assertBoardOwnership = require('../utils/assertBoardOwnership')

const getCards = async (req, res) => {
  const cards = await Card.find({})
  res.status(200).json(cards)
}

const createCard = async (req, res) => {
  const { name, columnId } = req.body
  const cleanName = name ? name.trim() : null  

  if(!cleanName || !columnId)
    return res.status(400).json({ error: 'content missing'})
  const column = await Column.findById(columnId)
  if (!column)
    return res.status(400).json({ error: 'column not found' })
  const board = await assertBoardOwnership(column.board, req.user.id)

  const maxOrderCard = await Card.findOne({ column: columnId })
    .sort('-order')
    .select('order')
    .lean()

  const baseOrder = maxOrderCard?.order ?? 0
  const newOrder = Math.ceil(baseOrder / 10) * 10 + 10

  const card = new Card({
    name: cleanName,
    owner: board.owner,
    board: board.id,
    column: columnId,
    order: newOrder
  })

  const savedCard = await card.save()
  column.cards = column.cards.concat(savedCard)
  await column.save()

  res.status(201).json(savedCard)
}

const renameCard = async (req, res) => {
  const { cardId } = req.params
  const { name } = req.body
  const cleanName = name ? name.trim() : null  

  if(!cleanName)
    return res.status(400).json({ error: 'name is required' })
  const card = await Card.findById(cardId)
  if(!card)
    return res.status(404).json({ error: 'card not found' })

  await assertBoardOwnership(card.board, req.user.id)

  card.name = cleanName
  await card.save()

  res.status(200).json(card)
}

const dragCard = async (req, res) => {
  const { index, columnId } = req.body
  const { cardId } = req.params

  if (!columnId) 
    return res.status(400).json({ error: 'columnId missing' })

  const card = await Card.findById(cardId)
  if (!card) return res.status(404).json({ error: 'card not found' })

  const oldColumn = await Column.findById(card.column)
  const newColumn = await Column.findById(columnId)
  if (!oldColumn || !newColumn)
    return res.status(400).json({ error: 'column not found' })

  const sortedCards = await Card
    .find({ column: columnId, _id: { $ne: cardId } })
    .sort({ order: 1 })

  const beforeCard = sortedCards[index - 1] || null
  const afterCard = sortedCards[index] || null

  if (!beforeCard && afterCard) {
    card.order = afterCard.order - 1
  } else if (beforeCard && afterCard) {
    card.order = (beforeCard.order + afterCard.order) / 2
  } else if (beforeCard && !afterCard) {
    card.order = beforeCard.order + 1
  } else {
    card.order = 0
  }

  if(oldColumn.id !== newColumn.id){
    oldColumn.cards = oldColumn.cards.filter(id => id.toString() !== cardId)
    newColumn.cards = newColumn.cards.concat(card._id)
    
    await oldColumn.save()
    await newColumn.save()

    card.column = newColumn._id
  }

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