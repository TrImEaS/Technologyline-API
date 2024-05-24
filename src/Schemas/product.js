const z = require ('zod')

const productSchema = z.object({
  name: z.string({
    required_error: 'Se requiere el nombre',
    invalid_type_error: 'El nombre debe de ser de tipo string/texto'
  }),
  category: z.string({
    required_error: 'Se requiere la categoria',
    invalid_type_error: 'La categoria debe de ser de tipo string/texto'
  }),
  sub_category: z.string({
    required_error: 'Se requiere la sub-categoria',
    invalid_type_error: 'La sub-categoria debe de ser de tipo string/texto'
  }),
  brand: z.string({
    required_error: 'Se requiere la marca',
    invalid_type_error: 'La marca debe de ser de tipo string/texto'
  }),
  img_base: z.string({
    required_error: 'Se requiere la marca',
    invalid_type_error: 'La marca debe de ser de tipo string/texto'
  }),
  images: z.array(z.string()),
  ean: z.number().int().positive(),
  sku: z.number().int().positive(),
  price: z.number().int().positive(),
  stock: z.number().int().positive(),
  status: z.boolean(),
  admin_status: z.boolean().nullable().default(null)
})

function validateProduct(object) {
  return productSchema.safeParse(object)
}

function validatePartialProduct(input) {
  return productSchema.partial().safeParse(input)
}

module.exports = { validateProduct, validatePartialProduct }