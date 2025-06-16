const express = require('express')
const router = express.Router()
const cardsController = require('../controllers/cards')

router.post('/', cardsController.createCard)

router.patch('/:cardId', cardsController.dragCard)

router.delete('/:cardId', cardsController.deleteCard)

module.exports = router