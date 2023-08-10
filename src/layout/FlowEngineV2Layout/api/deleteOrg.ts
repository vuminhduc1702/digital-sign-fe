import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export const deleteOrg = ({ orgId }: { orgId: string }) => {
  return axios.delete(`/api/organizations/${orgId}`)
}

type UseDeleteOrgOptions = {
  config?: MutationConfig<typeof deleteOrg>
}

export const useDeleteOrg = ({ config }: UseDeleteOrgOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['orgs'])
      addNotification({
        type: 'success',
        title: t('cloud:org_manage.org_manage.add_org.success_delete'),
      })
    },
    ...config,
    mutationFn: deleteOrg,
  })
}
