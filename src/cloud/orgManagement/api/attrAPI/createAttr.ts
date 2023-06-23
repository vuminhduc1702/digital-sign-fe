import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'
import { type attrSchema } from '~/utils/schemaValidation'

import { type Attribute } from '~/types'

export type EntityType =
  | 'ORGANIZATION'
  | 'GROUP'
  | 'DEVICE'
  | 'USER'
  | 'TEMPLATE'
  | 'EVENT'

export type AttributesDTO = z.infer<typeof attrSchema>

export type CreateAttrDTO = {
  data: {
    entity_id: string
    entity_type: EntityType
    attributes: AttributesDTO[]
  }
}

type AttributesRes = {
  attribute_key: string
  logged: boolean
  value: string | number | boolean
  last_update_ts: number
  value_type: Attribute['value_type']
}

type CreateAttrRes = {
  entity_id: string
  entity_type: EntityType
  attributes: AttributesRes[]
}

export const createAttr = ({ data }: CreateAttrDTO): Promise<CreateAttrRes> => {
  return axios.post(`/api/attributes`, data)
}

export type UseCreateAttrOptions = {
  config?: MutationConfig<typeof createAttr>
}

export const useCreateAttr = ({ config }: UseCreateAttrOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['attrs'])
      await queryClient.invalidateQueries(['deviceById'])
      addNotification({
        type: 'success',
        title: t('cloud:org_manage.org_manage.add_attr.success_create'),
      })
    },
    ...config,
    mutationFn: createAttr,
  })
}
