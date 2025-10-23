const { Router } = require('express')
const UsersController = require('../Controllers/users.js')

const usersRouter = Router()

usersRouter.get('/', UsersController.getAll)

module.exports = usersRouter
