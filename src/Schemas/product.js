/* const z = require ('zod')

const productSchema = z.object({
  stock: z.number().int().positive(),
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
  week_views: z.number().positive(),
  total_views: z.number().positive(),
  discount: z.number().positive(),
  specifications: z.string().default('Este producto no contiene especificaciones'),
  descriptions: z.string().default('Este producto no contiene descripcion'),
  sku: z.string({
    required_error: 'Se requiere el sku del producto.',
    invalid_type_error: 'El sku debe de ser de tipo string/texto'
  }),
  status: z.boolean(),
  adminStatus: z.boolean().default(null)
})

function validateProduct(object) {
  return productSchema.safeParse(object)
}

function validatePartialProduct(input) {
  return productSchema.partial().safeParse(input)
}

module.exports = { validateProduct, validatePartialProduct } */