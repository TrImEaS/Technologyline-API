const z = require('zod');

const receiptsSchema = z.object({
  number: z.number().positive(),
  employee_id: z.number().int().positive(),
  deposit_date: z.string({
    required_error: 'Se requiere la fecha de depósito',
    invalid_type_error: 'La fecha de depósito debe ser de tipo string/texto',
  }),
  remunerative_total: z.number().nonnegative(),
  no_remunerative_total: z.number().nonnegative(),
  discount_total: z.number().nonnegative(),
  total: z.number().nonnegative(),
  in_string_total: z.string({
    required_error: 'Se requiere el total en palabras',
    invalid_type_error: 'El total en palabras debe ser de tipo string/texto',
  }),
  payment_place_and_date: z.string({
    required_error: 'Se requiere el lugar y fecha de pago',
    invalid_type_error: 'El lugar y fecha de pago debe ser de tipo string/texto',
  }),
  payment_period: z.string({
    required_error: 'Se requiere el periodo de pago',
    invalid_type_error: 'El periodo de pago debe ser de tipo string/texto',
  }),
});

function validateReceipt(object) {
  return receiptsSchema.safeParse(object);
}

function validatePartialReceipt(object) {
  return receiptsSchema.partial().safeParse(object);
}

module.exports = { validateReceipt, validatePartialReceipt };
