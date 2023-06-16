import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

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

  const { addNotification } = useNotificationStore()
  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['templates'])
      addNotification({
        type: 'success',
        title: t('cloud:device_template.add_template.success_delete'),
      })
    },
    ...config,
    mutationFn: deleteTemplate,
  })
}
