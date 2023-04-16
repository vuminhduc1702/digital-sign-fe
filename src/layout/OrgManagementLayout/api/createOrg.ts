import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type Org } from '~/layout/MainLayout/types'

type CreateOrg = Pick<Org, 'name' | 'description' | 'org_id' | 'project_id'>
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
  data: CreateOrg
}

export const createOrg = ({ data }: CreateOrgDTO): Promise<CreateOrgRes> => {
  return axios.post(`/api/organizations`, data)
}

type UseCreateOrgOptions = {
  config?: MutationConfig<typeof createOrg>
}

export const useCreateOrg = ({ config }: UseCreateOrgOptions = {}) => {
  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['orgs'],
      })
      addNotification({
        type: 'success',
        title: 'Tạo tổ chức thành công',
      })
    },
    ...config,
    mutationFn: createOrg,
  })
}