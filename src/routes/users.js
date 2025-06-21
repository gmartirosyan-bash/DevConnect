const express = require('express')
const router = express.Router()
const usersController = require('../controllers/users')
const middleware = require('../middlewares/index')

router.get('/public', usersController.getUsers)

router.post('/public', usersController.createUser)

router.use(middleware.tokenExtractor, middleware.userExtractor)

router.patch('/:userId', usersController.editUser)
router.delete('/:userId', usersController.deleteUser)

module.exports = router