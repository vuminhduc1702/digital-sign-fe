import { z, type ZodTypeAny } from 'zod'
import i18n from '@/i18n'

export const nameSchema = z
  .string()
  .min(1, { message: i18n.t('schema:name_short') })
  .max(64, { message: i18n.t('schema:name_long') })

export const nameSchemaRegex = z
  .string()
  .min(1, { message: i18n.t('schema:name_short') })
  .max(64, { message: i18n.t('schema:name_long') })
  .regex(new RegExp('^[a-zA-Z0-9_]*$'), {
    message: i18n.t('schema:name_regex'),
  })

export const versionSchema = z
  .string()
  .regex(new RegExp('^[1-9]d*(.[1-9]d*)*'), {
    message: i18n.t('schema:version_scheam'),
  })

export const otpSchema = z.string().min(6, { message: i18n.t('schema:otp') })

export const descSchema = z.string()

export const emailSchema = z
  .string()
  .email({ message: i18n.t('schema:wrong_email') })
  .min(3, { message: i18n.t('schema:email_short') })
  .max(64, { message: i18n.t('schema:email_long') })

export const passwordSchema = z
  .string()
  .min(6, { message: i18n.t('schema:password_short') })
  .max(64, { message: i18n.t('schema:password_long') })

export const attrSchema = z.object({
  attribute_key: z
    .string()
    .min(1, { message: i18n.t('schema:attributename_short') })
    .max(64, { message: i18n.t('schema:attributename_long') }),
  value: z.string().optional(),
  logged: z.boolean().default(true),
  value_t: z.string().min(1, { message: i18n.t('schema:value_type') }),
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
  .min(1, { message: i18n.t('schema:leave_item') })
  .regex(new RegExp(/(0[3|5|7|8|9])+([0-9]{8})\b/g), {
    message: i18n.t('schema:phone_correct'),
  })

export const emptyInputSchema = z
  .string()
  .min(1, { message: i18n.t('schema:leave_item') })

export const emptySelectSchema = z
  .string()
  .min(1, { message: i18n.t('schema:select_item') })

export const attributeInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.string(),
  type: z.string(),
  action: z.string(),
})
