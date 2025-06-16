const express = require('express')
const router = express.Router()
const columnsController = require('../controllers/columns')

router.post('/', columnsController.createColumn)

router.patch('/:columnId', columnsController.renameColumn)

router.delete('/:columnId', columnsController.deleteColumn)

module.exports = router