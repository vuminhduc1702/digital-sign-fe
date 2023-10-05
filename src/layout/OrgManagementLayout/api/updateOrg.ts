import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type orgSchema } from '../components/CreateOrg'

export type UpdateOrgDTO = {
  data: Omit<z.infer<typeof orgSchema>, 'project_id'>
  orgId?: string
}

export const updateOrg = ({ data, orgId }: UpdateOrgDTO) => {
  return axios.put(`/api/organizations/${orgId}`, data)
}

type UseUpdateOrgOptions = {
  config?: MutationConfig<typeof updateOrg>
}

export const useUpdateOrg = ({ config }: UseUpdateOrgOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['orgs'],
      })
      addNotification({
        type: 'success',
        title: t('cloud:org_manage.org_manage.add_org.success_update'),
      })
    },
    ...config,
    mutationFn: updateOrg,
  })
}
