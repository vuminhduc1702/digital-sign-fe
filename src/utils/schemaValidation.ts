import { z } from 'zod'

export const nameSchema = z
  .string()
  .min(1, { message: 'Tên quá ngắn' })
  .max(30, { message: 'Tên quá dài' })

export const otpSchema = z
  .number()
  .min(6, { message: 'Vui lòng nhập đúng OTP' })

export const descSchema = z
  .string()
  .min(1, { message: 'Mô tả quá ngắn' })
  .max(30, { message: 'Mô tả quá dài' })

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

export const selectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
})
