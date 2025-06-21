const express = require('express')
const router = express.Router()
const columnsController = require('../controllers/columns')
const middleware = require('../middlewares/index')

router.get('/public', columnsController.getColumns)

router.use(middleware.tokenExtractor, middleware.userExtractor)

router.post('/', columnsController.createColumn)
router.patch('/:columnId', columnsController.renameColumn)
router.delete('/:columnId', columnsController.deleteColumn)

module.exports = router