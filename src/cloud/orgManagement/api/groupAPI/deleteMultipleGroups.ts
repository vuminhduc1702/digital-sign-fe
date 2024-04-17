import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { toast } from 'sonner'

export type deleteEntityMultipleGroupsDTO = {
  data: {
    ids: string[]
  }
}

export const deleteMultipleGroups = (data: deleteEntityMultipleGroupsDTO) => {
  return axios.delete(`/api/groups/remove/list`, data)
}

type UseDeleteMultipleGroupOptions = {
  config?: MutationConfig<typeof deleteMultipleGroups>
}

export const useDeleteMultipleGroup = ({
  config,
}: UseDeleteMultipleGroupOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      toast.promise(() => queryClient.invalidateQueries(['groups']), {
        loading: t('loading:loading'),
        success: t('cloud:org_manage.group_manage.add_group.success_delete'),
        error: t('error:server_res.title'),
      })
    },
    ...config,
    mutationFn: deleteMultipleGroups,
  })
}
