const z = require('zod');

const employeeSchema = z.object({
  docket: z.bigint().positive({
    required_error: 'Se requiere el número de legajo (docket)',
    invalid_type_error: 'El número de legajo debe ser un número entero positivo',
  }),
  full_name: z.string({
    required_error: 'Se requiere el nombre completo',
    invalid_type_error: 'El nombre completo debe ser de tipo string/texto',
  }),
  domicile: z.string().nullable().optional(),
  birth_date: z.string({
    required_error: 'Se requiere la fecha de nacimiento',
    invalid_type_error: 'La fecha de nacimiento debe ser de tipo string/texto',
  }),
  nacionality: z.string({
    required_error: 'Se requiere la nacionalidad',
    invalid_type_error: 'La nacionalidad debe ser de tipo string/texto',
  }),
  dni: z.bigint().positive({
    required_error: 'Se requiere el DNI',
    invalid_type_error: 'El DNI debe ser un número entero positivo',
  }),
  salary_settlement: z.string().default('MENSUAL'),
  sector: z.string().nullable().optional(),
  categoria: z.string().nullable().optional(),
  basic: z.number().nullable().optional(),
  cuil: z.bigint().positive({
    required_error: 'Se requiere el CUIL',
    invalid_type_error: 'El CUIL debe ser un número entero positivo',
  }),
  admision_date: z.string({
    required_error: 'Se requiere la fecha de admisión',
    invalid_type_error: 'La fecha de admisión debe ser de tipo string/texto',
  }),
  departure_date: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  civilstatus: z.string().nullable().optional(),
  activo: z.boolean().default(1),
});

function validateEmployee(object) {
  return employeeSchema.safeParse(object);
}

function validatePartialEmployee(input) {
  return employeeSchema.partial().safeParse(input);
}

module.exports = { validateEmployee, validatePartialEmployee };
