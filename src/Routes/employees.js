const { Router } = require('express')
const EmployeesController = require('../Controllers/employees.js')

const employeesRouter = Router()
employeesRouter.get('/', EmployeesController.getAll)

module.exports = employeesRouter