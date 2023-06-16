import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export const deleteDevice = ({ id }: { id: string }) => {
  return axios.delete(`/api/devices/${id}`)
}

type UseDeleteDeviceOptions = {
  config?: MutationConfig<typeof deleteDevice>
}

export const useDeleteDevice = ({ config }: UseDeleteDeviceOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['devices'])
      addNotification({
        type: 'success',
        title: t('cloud:org_manage.device_manage.add_device.success_delete'),
      })
    },
    ...config,
    mutationFn: deleteDevice,
  })
}
