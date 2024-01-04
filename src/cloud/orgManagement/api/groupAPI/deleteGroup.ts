import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

export const deleteGroup = ({ id }: { id: string }) => {
  return axios.delete(`/api/groups/${id}`)
}

type UseDeleteGroupOptions = {
  config?: MutationConfig<typeof deleteGroup>
}

export const useDeleteGroup = ({ config }: UseDeleteGroupOptions = {}) => {
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
    mutationFn: deleteGroup,
  })
}
