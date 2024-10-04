const ReceiptsModel = require("../Models/sql/receipts");
const { validatePartialReceipt, validateReceipt } = require ('../Schemas/receipts.js')

class ReceiptsController {
  static async getAll(req, res) {
    try {
      const { id } = req.query
      const receipt = await ReceiptsModel.getAll({ id, number, employee_id, deposit_date })

      res.json(receipt)
    } 
    catch (e) {
      console.error('Error getting receipt/s:', e); 
      res.status(500).json({ error: 'Error al obtener recibo/s' });
    }
  }
}

module.exports = ReceiptsController;
