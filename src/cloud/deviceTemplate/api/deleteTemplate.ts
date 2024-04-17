import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { toast } from 'sonner'

export const deleteTemplate = ({ id }: { id: string }) => {
  return axios.delete(`/api/templates/${id}`)
}

type UseDeleteTemplateOptions = {
  config?: MutationConfig<typeof deleteTemplate>
}

export const useDeleteTemplate = ({
  config,
}: UseDeleteTemplateOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      toast.promise(() => queryClient.invalidateQueries(['templates']), {
        loading: t('loading:loading'),
        success: t('cloud:device_template.add_template.success_delete'),
        error: t('error:server_res.title'),
      })
    },
    ...config,
    mutationFn: deleteTemplate,
  })
}
