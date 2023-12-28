import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

import { type Attribute } from '~/types'
import { type AttrList} from '~/utils/schemaValidation'

export type EntityType =
  | 'ORGANIZATION'
  | 'GROUP'
  | 'DEVICE'
  | 'USER'
  | 'TEMPLATE'
  | 'EVENT'

export type CreateAttrDTO = {
  data: {
    entity_id: string
    entity_type: EntityType
    attributes: AttrList
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

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['attrs'])
      toast.success(t('cloud:org_manage.org_manage.add_attr.success_create'))
    },
    ...config,
    mutationFn: createAttr,
  })
}
