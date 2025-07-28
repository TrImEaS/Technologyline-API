/* const z = require ('zod')

const resellers_form = z.object({
  fullname: z.string({
    required_error: 'Se requiere el nombre completo',
    invalid_type_error: 'El nombre debe de ser de tipo string/texto'
  }),
  email: z.string().email().nullable(),
  phone: z.number().positive(),
  comentary: z.string({
    required_error: 'Se requiere el comentario',
    invalid_type_error: 'El comentario debe de ser de tipo string/texto'
  }),
  view: z.number().default(0)
});

function validateResellers_Form(object) {
  return resellers_form.safeParse(object)
}

function validatePartialResellers_Form(input) {
  return resellers_form.partial().safeParse(input)
}

module.exports = { validatePartialResellers_Form, validateResellers_Form }  */
