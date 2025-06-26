const express = require('express')
const router = express.Router()
const cardsController = require('../controllers/cards')
const middleware = require('../middlewares/index')

router.get('/public', cardsController.getCards)

router.use(middleware.tokenExtractor, middleware.userExtractor)

router.post('/', cardsController.createCard)
router.patch('/:cardId/name', cardsController.renameCard)
router.patch('/:cardId/drag', cardsController.dragCard)
router.delete('/:cardId', cardsController.deleteCard)

module.exports = router