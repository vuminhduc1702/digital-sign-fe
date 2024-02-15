import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

export type deleteEntityMultipleAttrsDTO = {
  data: {
    keys: string[]
    entity_type: string
    entity_id: string
  }
}

export const deleteMultipleAttrs = (data: deleteEntityMultipleAttrsDTO) => {
  return axios.delete(`/api/attributes/remove/list`, data)
}

type UseDeleteMultipleAttrOptions = {
  config?: MutationConfig<typeof deleteMultipleAttrs>
}

export const useDeleteMultipleAttrs = ({
  config,
}: UseDeleteMultipleAttrOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      toast.promise(() => queryClient.invalidateQueries(['attrs']), {
        loading: t('loading:loading'),
        success: t('cloud:org_manage.org_manage.add_attr.success_delete'),
        error: t('error:server_res.title'),
      })
    },
    ...config,
    mutationFn: deleteMultipleAttrs,
  })
}
