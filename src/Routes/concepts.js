const { Router } = require ('express')
const ConceptController = require ('../Controllers/concepts.js')
const conceptRouter = Router()

conceptRouter.get('/', ConceptController.getAll)
conceptRouter.post('/', ConceptController.create)
conceptRouter.patch('/:id', ConceptController.update)
conceptRouter.delete('/:id', ConceptController.delete)

module.exports = conceptRouter  