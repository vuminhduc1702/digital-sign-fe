import { z } from 'zod'

export const nameSchema = z
  .string()
  .min(3, { message: 'Tên quá ngắn' })
  .max(30, { message: 'Tên quá dài' })

export const passwordSchema = z
  .string()
  .min(6, { message: 'Password quá ngắn' })
  .max(100, { message: 'Password quá dài' })

export const emailSchema = z
  .string()
  .email({ message: 'Nhập sai định dạng email' })
  .min(3, { message: 'Email quá ngắn' })
  .max(100, { message: 'Email quá dài' })
