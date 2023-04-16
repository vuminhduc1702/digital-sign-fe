import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type Attribute } from '~/layout/MainLayout/types'

export type EntityType =
  | 'ORGANIZATION'
  | 'GROUP'
  | 'DEVICE'
  | 'USER'
  | 'TEMPLATE'
  | 'EVENT'

type Attributes = {
  attribute_key: string
  logged: boolean
  value?: string | number | boolean
  value_t: string
}

export type CreateAttrDTO = {
  data: {
    entity_id: string
    entity_type: EntityType
    attributes: Attributes[]
  }
}

type AttributesRes = {
  attribute_type: string
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
  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orgById'] })
      addNotification({
        type: 'success',
        title: 'Tạo thuộc tính thành công',
      })
    },
    ...config,
    mutationFn: createAttr,
  })
}
