const EmployeeModel = require('../Models/json/employee.js')
// const { validatePartialEmployee, validateEmployee } = require('../Schemas/employees.js')

class EmployeeController {
  // Get all employees
  static async getAll (req, res) {
    const { company, active } = req.query
    const employees = await EmployeeModel.getAll({ company, active })
    res.json(employees)
  }

  // Get an employee by id
  static async getById (req, res) {
    const { id } = req.params
    const employee = await EmployeeModel.getById(parseInt(id))
    if (employee) return res.json(employee)

    res.status(404).json({ message: 'Employee not found' })
  }

  // Create an employee
  static async create (req, res) {
    try {
      const newId = await EmployeeModel.getNextId()
      const input = {
        id: newId,
        company: (req.body.company).toLowerCase().trim().replace(/\s+/g, ''),
        active: 1,
        ...req.body
      }

      // const result = validateEmployee(input)

      // if (result.error) {
      //   return res.status(422).json({ error: JSON.parse(result.error.message) })
      // }

      const newEmployee = await EmployeeModel.create({ input })
      if (!newEmployee) { return res.status(422).json({ message: `El legajo ingresado ya esta en uso, ultimo legajo usado en ${input.company} es ${input.docket}` }) }
      return res.status(201).json(newEmployee)
    } catch (e) {
      console.log('Error creating employee: ', e)

      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  // Edit an employee with the docket
  static async update (req, res) {
    try {
      const result = req.body

      // if (!result.success) { return res.status(400).json({ error: JSON.parse(result.error.message) }) }

      const { id } = req.params

      const updateEmployee = await EmployeeModel.update({ id, input: result.data })

      return res.json(updateEmployee)
    } catch (e) {
      console.log('Error updating employee: ', e)

      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  // Delete an employee with the docket
  static async delete (req, res) {
    try {
      const result = req.body

      // if (!result.success) { return res.status(400).json({ error: JSON.parse(result.error.message) }) }

      const { id } = req.params

      if (result.data.activo === undefined) {
        return res.status(400).json({ error: 'Se requiere especificar si el empleado esta activo o no ("activo": false/true)' })
      }

      const updateEmployee = await EmployeeModel.update({ id, input: result.data })

      return res.json(updateEmployee)
    } catch (e) {
      console.log('Error deleting employee: ', e)

      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}

module.exports = EmployeeController
