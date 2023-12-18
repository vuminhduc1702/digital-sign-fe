import { z, type ZodTypeAny } from 'zod'

export const nameSchema = z
  .string()
  .min(1, { message: 'Tên quá ngắn' })
  .max(64, { message: 'Tên quá dài' })

export const nameSchemaRegex = z
  .string()
  .min(1, { message: 'Tên quá ngắn' })
  .max(64, { message: 'Tên quá dài' })
  .regex(new RegExp('^[a-zA-Z0-9_]*$'), {
    message:
      'Tên service chỉ bao gồm chữ, số, hoặc kí tự _, không bao gồm khoảng trống hoặc kí tự đặc biệt',
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
  .max(64, { message: 'Email quá dài' })

export const passwordSchema = z
  .string()
  .min(6, { message: 'Password quá ngắn' })
  .max(64, { message: 'Password quá dài' })

export const attrSchema = z.object({
  attribute_key: z
    .string()
    .min(1, { message: 'Tên thuộc tính quá ngắn' })
    .max(64, { message: 'Tên thuộc tính quá dài' }),
  value: z.string().optional(),
  logged: z.boolean().default(true),
  value_t: z.string().min(1, { message: 'Vui lòng chọn loại giá trị' }),
})

export const attrListSchema = z.array(attrSchema)
export type AttrList = z.infer<typeof attrListSchema>

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

export const attributeInfoSchema = z.object({
    id: z.string(),
    name: z.string(),
    kind: z.string(),
    type: z.string(),
    action: z.string(),
  })
  
export const moduleConfigSchema = z.object({
    Observe: z.boolean(),
    attribute_info: z.array(attributeInfoSchema),
    created_time: z.number(),
    id: z.string(),
    module_name: z.string(),
    numberOfAttributes: z.number(),
  })
export const ConfigItem = z.object({
    [z.string()]: z.string(),
  })
export const transportConfigSchema = z.object({
    protocol: z.string(),
    config: z.record(ConfigItem),
    info: z.object({
      module_config: z.array(moduleConfigSchema).nullable(),
    }),
  })
export type TransportConfig = z.infer<typeof transportConfigSchema>