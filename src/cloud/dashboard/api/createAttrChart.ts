import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { queryClient, type MutationConfig } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'
import { type attrSchema } from '~/utils/schemaValidation'

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
    entity_ids: string[]
    entity_type: EntityType
    time_series: boolean
    
  }
}

type CreateAttrRes = {
  entity_ids: string[]
  entity_type: EntityType
  time_series: boolean
  key: any[]
}

export const createAttrChart = ({
  data,
}: CreateAttrDTO): Promise<CreateAttrRes> => {
  return axios.post(`/api/attributes/datakey`, data)
}

export type UseCreateAttrOptions = {
  config?: MutationConfig<typeof createAttrChart>
}

export const useCreateAttrChart = ({ config }: UseCreateAttrOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['attrs-chart'])
      // addNotification({
      //   type: 'success',
      //   title: t('cloud:org_manage.org_manage.add_attr.success_create'),
      // })
    },
    ...config,
    mutationFn: createAttrChart,
  })
}
