import { z, type ZodTypeAny } from 'zod'

export const nameSchema = z
  .string()
  .min(1, { message: 'Tên quá ngắn' })
  .max(30, { message: 'Tên quá dài' })

export const nameSchemaRegex = z
  .string()
  .min(1, { message: 'Tên quá ngắn' })
  .max(30, { message: 'Tên quá dài' })
  .regex(new RegExp('^[a-zA-Z0-9_]*$'), {
    message:
      'Tên service chỉ bao gồm chữ, số, hoăc kí tự _, không bao gồm khoảng trống hoặc kí tự đặc biệt',
  })

export const otpSchema = z
  .string()
  .min(6, { message: 'Vui lòng nhập đúng OTP' })

export const descSchema = z.string()

export const emailSchema = z
  .string()
  .email({ message: 'Nhập sai định dạng email' })
  .min(3, { message: 'Email quá ngắn' })
  .max(100, { message: 'Email quá dài' })

export const passwordSchema = z
  .string()
  .min(6, { message: 'Password quá ngắn' })
  .max(100, { message: 'Password quá dài' })

export const attrSchema = z.object({
  attribute_key: z
    .string()
    .min(1, { message: 'Tên thuộc tính quá ngắn' })
    .max(30, { message: 'Tên thuộc tính quá dài' }),
  value: z.string().optional(),
  logged: z.boolean().or(z.string()),
  value_t: z.string().min(1, { message: 'Vui lòng chọn loại giá trị' }),
})

export const selectOptionSchema = (valueSchema?: ZodTypeAny) => {
  return z.object({
    label: z.string(),
    value: valueSchema || z.string(),
  })
}

export const BasePaginationSchema = z.object({
  total: z.number(),
  offset: z.number(),
  limit: z.number(),
})
