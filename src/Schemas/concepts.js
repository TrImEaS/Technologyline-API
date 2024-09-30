const z = require('zod');

const conceptsSchema = z.object({
  name: z.string({
    required_error: 'Se requiere nombre de concepto',
    invalid_type_error: 'El nombre debe de ser de tipo string/texto'
  }),
  number: z.number().positive({
    required_error: 'Se requiere número de concepto',
    invalid_type_error: 'El número debe de ser positivo y de tipo numérico'
  }),
  type: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3)
  ], {
    required_error: 'Se requiere tipo de concepto',
    invalid_type_error: 'El tipo debe de ser 1, 2 o 3'
  }),
  active: z.number({
    required_error: 'Se requiere estado activo',
    invalid_type_error: 'El estado activo debe de ser de tipo numérico'
  }).default(1),
  baseConceptIds: z.array(z.number(), {
    required_error: 'Se requiere lista de IDs de conceptos base',
    invalid_type_error: 'Los IDs de conceptos base deben ser un array de números'
  }),
  formula: z.string().optional()
});

function validateConcept(object) {
  return conceptsSchema.safeParse(object);
}

function validatePartialConcept(input) {
  return conceptsSchema.partial().safeParse(input);
}

module.exports = { validateConcept, validatePartialConcept };
