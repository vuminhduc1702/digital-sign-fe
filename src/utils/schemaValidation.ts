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

export const versionSchema = z
  .string()
  .regex(new RegExp('^[1-9]d*(.[1-9]d*)*'), {
    message: 'Vui lòng nhập số phiên bản có dạng x.x.x | VD 1.0.0',
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
  logged: z.boolean(),
  value_t: z.string().min(1, { message: 'Vui lòng chọn loại giá trị' }),
})

export const attrListSchema = z.array(attrSchema)

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

export const phoneSchemaRegex = z
  .string()
  .min(1, { message: 'Vui lòng không bỏ trống mục này' })
  .regex(new RegExp(/(0[3|5|7|8|9])+([0-9]{8})\b/g), {
    message: 'Số điện thoại chưa đúng định dạng',
  })

export const emptyInputSchema = z
  .string()
  .min(1, { message: 'Vui lòng không bỏ trống mục này' })
  
export const emptySelectSchema = z
  .string()
  .min(1, { message: 'Vui lòng chọn mục này' })