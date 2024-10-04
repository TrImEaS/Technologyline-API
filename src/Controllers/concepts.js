const ConceptModel = require ('../Models/sql/concepts.js')
const { validatePartialConcept, validateConcept } = require ('../Schemas/concepts.js')

class ConceptController {
  static async getAll(req, res) {
    try {
      const { id, name, number, all } = req.query
      const concept = await ConceptModel.getAll({ id, name, number, all })

      res.json(concept)
    } 
    catch (e) {
      console.error('Error getting all concepts:', e); 
      res.status(500).json({ error: 'Error al obtener los conceptos' });
    }
  }

  static async create(req, res) { 
    try {
      const result = validateConcept(req.body);
      if (result.error) {
        return res.status(422).json({ error: JSON.parse(result.error.message) });
      }
      
      const newConcept = await ConceptModel.create({ input: result.data });
      if (!newConcept) {
        return res.status(403).json({ error: 'El numero/nombre de concepto ya existe!' });
      }
  
      return res.status(201).json(newConcept);
    } 
    catch (e) {
      console.error('Error creating concept: ', e);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async update (req, res) { 
    try {
      const result = validatePartialConcept(req.body)      
      if (!result.success) 
        return res.status(422).json({ error: JSON.parse(result.error.message) })

      const { id } = req.params
    
      const updateConcept = await ConceptModel.update({ id: parseInt(id), input: result.data })  
      res.json(updateConcept)
    } 
    catch (e) {
      console.log('Error updating concept: ', e)
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async delete (req, res) {
    try {
      const { id } = req.params

      const result = await ConceptModel.delete({ id: parseInt(id) })
      if (!result)
        return res.status(404).json({ error: 'Concept not found'})
  
      res.json(result)
    } 
    catch (e) {
      console.log('Error borrando concepto: ', e)
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = ConceptController;
