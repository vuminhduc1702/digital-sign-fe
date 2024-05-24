import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { toast } from 'sonner'

export const deleteSubcription = ({ id }: { id: string }) => {
  return axios.delete(`/api/priceplan/subscription/cancel/${id}`)
}

type UseDeleteSubcriptionOptions = {
  config?: MutationConfig<typeof deleteSubcription>
}

export const useDeleteSubcription = ({
  config,
}: UseDeleteSubcriptionOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      toast.promise(() => queryClient.invalidateQueries(['subcriptions']), {
        loading: t('loading:loading'),
        success: t('billing:subcription.popup.success_delete'),
        error: t('error:server_res.title'),
      })
    },
    ...config,
    mutationFn: deleteSubcription,
  })
}
