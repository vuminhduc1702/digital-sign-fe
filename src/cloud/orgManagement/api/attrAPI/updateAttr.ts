import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type attrListSchema } from '~/utils/schemaValidation'

export type UpdateAttrDTO = {
  data: {
    attributes: z.infer<typeof attrListSchema>
  }
  entityType: string
  entityId: string
}

export const updateAttr = ({ data, entityType, entityId }: UpdateAttrDTO) => {
  return axios.put(`/api/attributes/${entityType}/${entityId}/values`, data)
}

export type UseUpdateAttrOptions = {
  config?: MutationConfig<typeof updateAttr>
}

export const 
useUpdateAttr = ({ config }: UseUpdateAttrOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['attrs'])
      // await queryClient.invalidateQueries(['deviceById'])
      addNotification({
        type: 'success',
        title: t('cloud:org_manage.org_manage.add_attr.success_update'),
      })
    },
    ...config,
    mutationFn: updateAttr,
  })
}
