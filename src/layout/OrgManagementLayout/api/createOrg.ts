import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type orgSchema } from '../components/CreateOrg'

type CreateOrgRes = {
  id: string
  name: string
  image?: string
  description: string
  group_id?: string
  org_id?: string
  project_id: string
}

export type CreateOrgDTO = {
  data: z.infer<typeof orgSchema>
}

export const createOrg = ({ data }: CreateOrgDTO): Promise<CreateOrgRes> => {
  return axios.post(`/api/organizations`, data)
}

type UseCreateOrgOptions = {
  config?: MutationConfig<typeof createOrg>
}

export const useCreateOrg = ({ config }: UseCreateOrgOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['orgs'],
      })
      addNotification({
        type: 'success',
        title: t('cloud:org_manage.org_manage.add_org.success_create'),
      })
    },
    ...config,
    mutationFn: createOrg,
  })
}
