import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'
import type * as z from 'zod'
import { type entitySubcriptionUpdateSchema } from '../../components/Subcription/UpdateSubcription'

export type UpdateSubcriptionDTO = {
  data: z.infer<typeof entitySubcriptionUpdateSchema>
  id: string
}

export const updateSubcription = ({ data, id }: UpdateSubcriptionDTO) => {
  return axios.put(`/api/priceplan/subscription/update/${id}`, data)
}

type UseUpdateSubcriptionOptions = {
  config?: MutationConfig<typeof updateSubcription>
}

export const useUpdateSubcription = ({ config }: UseUpdateSubcriptionOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['subcriptions'],
      })
      addNotification({
        type: 'success',
        title: t('billing:subcription.popup.success_update'),
      })
    },
    ...config,
    mutationFn: updateSubcription,
  })
}
