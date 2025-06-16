const express = require('express')
const router = express.Router()
const boardsController = require('../controllers/boards')

router.get('/', boardsController.getBoardsByUser)

router.get('/:boardId', boardsController.getFullBoard)

router.patch('/:boardId', boardsController.renameBoard)

router.post('/', boardsController.createBoard)

router.delete('/:boardId', boardsController.deleteBoard)

module.exports = router