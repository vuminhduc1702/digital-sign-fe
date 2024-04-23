import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { toast } from 'sonner'

export type UpdateGroupDTO = {
  data: {
    name: string
    org_id: string
  }
  groupId: string
}

export const updateGroup = ({ data, groupId }: UpdateGroupDTO) => {
  return axios.put(`/api/groups/${groupId}`, data)
}

type UseUpdateGroupOptions = {
  config?: MutationConfig<typeof updateGroup>
}

export const useUpdateGroup = ({ config }: UseUpdateGroupOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['groups'],
      })
      toast.success(t('cloud:org_manage.group_manage.add_group.success_update'))
    },
    ...config,
    mutationFn: updateGroup,
  })
}
