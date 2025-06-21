const express = require('express')
const router = express.Router()
const boardsController = require('../controllers/boards')
const middleware = require('../middlewares/index')

router.get('/public', boardsController.getBoards)

router.use(middleware.tokenExtractor, middleware.userExtractor)

router.get('/', boardsController.getBoardsByUser)
router.get('/:boardId', boardsController.getFullBoard)
router.patch('/:boardId', boardsController.renameBoard)
router.post('/', boardsController.createBoard)
router.delete('/:boardId', boardsController.deleteBoard)

module.exports = router