import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type Attribute } from '~/layout/MainLayout/types'

type EntityType =
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
    attributes: {
      attribute_key: string
      logged: boolean
      value?: string | number | boolean
      value_t: string
    }
  }
}

type CreateAttrRes = {
  entity_id: string
  entity_type: EntityType
  attributes: {
    attribute_type: string
    attribute_key: string
    logged: boolean
    value: string | number | boolean
    last_update_ts: number
    value_type: Attribute['value_type']
  }
}

export const createAttr = ({ data }: CreateAttrDTO): Promise<CreateAttrRes> => {
  console.log('data', data)
  return axios.post(`/api/attributes`, data)
}

export type UseCreateAttrOptions = {
  entityId: string
  entityType: EntityType
  logged: boolean
  valueType: Attribute['value_type']
  config?: MutationConfig<typeof createAttr>
}

export const useCreateAttr = ({
  entityId,
  entityType,
  logged,
  valueType,
  config,
}: UseCreateAttrOptions) => {
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
    mutationFn: ({ data }: CreateAttrDTO) =>
      createAttr({
        data: {
          ...data,
          entity_id: entityId,
          entity_type: entityType,
          attributes: {
            logged,
            value_t: valueType,
          },
        },
      }),
    // mutationFn: createAttr,
  })
}
