const EmployeesModel = require("../Models/sql/employees");

class EmployeesController {
  static async getAll(req, res) {
    try {
      const { id, full_name, docket, company, sector, category, dni, cuil, active } = req.query
      const employee = await EmployeesModel.getAll({ id, full_name, docket, company, sector, category, dni, cuil, active })

      res.json(employee)
    } 
    catch (e) {
      console.error('Error getting employees:', e); 
      res.status(500).json({ error: 'Error al obtener empleados' });
    }
  }
}

module.exports = EmployeesController;
