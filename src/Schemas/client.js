/* const z = require ('zod')

const clientSchema = z.object({
  fullname: z.string().min(3).max(100),
  dni: z.string().length(8),
  address: z.string().min(3).max(100),
  postalCode: z.string().length(5),
  phone: z.string().length(9),
  email: z.string().email(),
  password: z.string().min(8).max(20)
});

function validateClient(object) {
  return clientSchema.safeParse(object)
}

function validatePartialClient(object) {
  return clientSchema.partial().safeParse(object)
}

module.exports = { validateClient, validatePartialClient } */
