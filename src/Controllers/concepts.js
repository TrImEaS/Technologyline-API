const ConceptModel = require('../Models/json/concepts.js')
// const { validatePartialConcept, validateConcept } = require('../Schemas/concepts.js')

class ConceptController {
  // Get all concepts
  static async getAll (req, res) {
    const { name, status } = req.query
    const employees = await ConceptModel.getAll({ name, status })
    res.json(employees)
  }

  // Get an concept by id
  static async getById (req, res) {
    const { id } = req.params
    const concept = await ConceptModel.getById(parseInt(id))
    if (concept) return res.json(concept)

    res.status(404).json({ message: 'Employee not found' })
  }

  // Create an concept
  static async create (req, res) {
    try {
      const newId = await ConceptModel.getNextId()

      const input = {
        id: newId,
        name: req.body.name.trim(),
        type: (req.body.type).toUpperCase().trim(),
        status: 1
      }

      // const result = validateConcept(input)

      // if (result.error) {
      //   return res.status(422).json({ error: JSON.parse(result.error.message) })
      // }

      const newConcept = await ConceptModel.create({ input })

      res.status(201).json(newConcept)
    } catch (e) {
      console.log('Error updating concept: ', e)

      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  // Edit an concept by id
  static async update (req, res) {
    try {
      const result = req.body

      // if (!result.success) { return res.status(400).json({ error: JSON.parse(result.error.message) }) }

      const { id } = req.params
      const updateConcept = await ConceptModel.update({ id, input: result.data })
      return res.json(updateConcept)
    } catch (e) {
      console.log('Error updating concept: ', e)

      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async delete (req, res) {
    try {
      const { id } = req.params
      const result = await ConceptModel.delete({ id })

      if (result.error) {
        return res.status(404).json({ error: 'Concept not found' })
      }

      return res.json(result)
    } catch (e) {
      console.log('Error deleting concept: ', e)

      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}

module.exports = ConceptController
