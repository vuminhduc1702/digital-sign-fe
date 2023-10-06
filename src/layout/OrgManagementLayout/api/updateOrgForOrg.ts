import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export type UpdateOrgForOrgDTO = {
  data: {
    ids?: string[],
    org_id?: string
  }
}

export const updateOrgForOrg = ({ data }: UpdateOrgForOrgDTO) => {
  return axios.put(`/api/organizations/organization`, data)
}

type UseUpdateOrgForOrgOptions = {
  config?: MutationConfig<typeof updateOrgForOrg>
}

export const useUpdateOrgForOrg = ({ config }: UseUpdateOrgForOrgOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['orgs'],
      })
      // addNotification({
      //   type: 'success',
      //   title: t('cloud:org_manage.org_manage.add_org.success_update'),
      // })
    },
    ...config,
    mutationFn: updateOrgForOrg,
  })
}
