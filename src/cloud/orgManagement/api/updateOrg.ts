import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type Org } from '~/layout/MainLayout/types'

type UpdateOrg = Pick<Org, 'name'> & Partial<Omit<Org, 'name'>>

export type UpdateOrgDTO = {
  data: UpdateOrg
}

export const updateOrg = ({ data }: UpdateOrgDTO): Promise<void> => {
  return axios.put(`/api/organizations`, data)
}

type UseUpdateOrgOptions = {
  config?: MutationConfig<typeof updateOrg>
}

export const useUpdateOrg = ({ config }: UseUpdateOrgOptions) => {
  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['orgs'],
      })
      addNotification({
        type: 'success',
        title: 'Sửa tổ chức thành công',
      })
    },
    ...config,
    mutationFn: ({ data }: UpdateOrgDTO) =>
      updateOrg({
        data: {
          ...data,
        },
      }),
  })
}
