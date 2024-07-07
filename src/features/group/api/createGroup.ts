import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { type BaseAPIRes } from '@/types'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export type CreateGroupDTO = {
  userIds: number[]
  groupName: string
}

export const createGroup = (data: CreateGroupDTO) => {
  return axios.post(`/api/group`, data)
}

type CreateGroupOptions = {
  config?: MutationConfig<typeof createGroup>
}
export const useCreateGroup = ({ config }: CreateGroupOptions = {}) => {
  const {t} = useTranslation()
  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['group'],
      })
      toast.success(t('group:success'))
    },
    ...config,
    mutationFn: createGroup,
  })
}
