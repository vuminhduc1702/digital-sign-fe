import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export const deleteSubcription = ({ id }: { id: string }) => {
  return axios.delete(`/api/priceplan/subscription/cancel/${id}`)
}

type UseDeleteSubcriptionOptions = {
  config?: MutationConfig<typeof deleteSubcription>
}

export const useDeleteSubcription = ({ config }: UseDeleteSubcriptionOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['subcriptions'])
      addNotification({
        type: 'success',
        title: t('billing:subcription.popup.success_delete'),
      })
    },
    ...config,
    mutationFn: deleteSubcription,
  })
}
