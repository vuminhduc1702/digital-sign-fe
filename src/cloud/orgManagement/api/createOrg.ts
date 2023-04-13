import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type Org } from '~/layout/MainLayout/types'

type OrgCreate = Pick<Org, 'name' | 'description' | 'org_id' | 'project_id'>
type OrgCreateRes = {
  id: string
  name: string
  image?: string
  description: string
  group_id?: string
  org_id?: string
  project_id: string
}

export type CreateOrgDTO = {
  data: OrgCreate
}

export const createOrg = ({ data }: CreateOrgDTO): Promise<OrgCreateRes> => {
  return axios.post(`/api/organizations`, data)
}

type UseCreateOrgOptions = {
  projectId: string
  orgId?: string
  config?: MutationConfig<typeof createOrg>
}

export const useCreateOrg = ({
  projectId,
  orgId,
  config,
}: UseCreateOrgOptions) => {
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
    mutationFn: ({ data }: CreateOrgDTO) =>
      createOrg({
        data: {
          ...data,
          project_id: projectId,
          org_id: orgId,
        },
      }),
  })
}
