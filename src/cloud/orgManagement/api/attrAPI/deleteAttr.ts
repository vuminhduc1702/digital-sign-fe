import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type EntityType } from './createAttr'

type DeleteAttr = {
  entityId: string
  entityType: EntityType
  attrKey: string
}

export const deleteAttr = ({ entityId, entityType, attrKey }: DeleteAttr) => {
  return axios.delete(
    `/api/attributes/${entityType}/${entityId}/SCOPE_CLIENT/${attrKey}/values`,
  )
}

type UseDeleteAttrOptions = {
  config?: MutationConfig<typeof deleteAttr>
}

export const useDeleteAttr = ({ config }: UseDeleteAttrOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['attrs'])
      await queryClient.invalidateQueries(['deviceById'])
      addNotification({
        type: 'success',
        title: t('cloud:org_manage.org_manage.add_attr.success_delete'),
      })
    },
    ...config,
    mutationFn: deleteAttr,
  })
}
