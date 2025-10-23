const { Router } = require('express')
const EmployeeController = require('../Controllers/employees.js')

const employeeRouter = Router()

employeeRouter.get('/', EmployeeController.getAll)
employeeRouter.post('/', EmployeeController.create)

employeeRouter.get('/:id', EmployeeController.getById)
employeeRouter.patch('/:id', EmployeeController.update)
employeeRouter.delete('/:id', EmployeeController.delete)

module.exports = employeeRouter
