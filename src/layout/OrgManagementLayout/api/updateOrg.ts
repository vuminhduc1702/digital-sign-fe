import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { toast } from 'sonner'

import { type orgSchema } from '../components/CreateOrg'

export type UpdateOrgDTO = {
  data: Omit<z.infer<typeof orgSchema>, 'project_id'>
  org_id?: string
}

export const updateOrg = ({ data, org_id }: UpdateOrgDTO) => {
  return axios.put(`/api/organizations/${org_id}`, data)
}

type UseUpdateOrgOptions = {
  config?: MutationConfig<typeof updateOrg>
  isOnCreateOrg?: boolean
}

export const useUpdateOrg = ({
  config,
  isOnCreateOrg,
}: UseUpdateOrgOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['orgs'],
      })
      !isOnCreateOrg &&
        toast.success(t('cloud:org_manage.org_manage.add_org.success_update'))
    },
    ...config,
    mutationFn: updateOrg,
  })
}
