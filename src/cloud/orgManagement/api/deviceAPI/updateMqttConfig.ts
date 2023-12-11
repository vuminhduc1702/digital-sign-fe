import { type z } from 'zod'
import { type mqttConfigSchema } from '../../components/Device/UpdateMqttConfig'
import { axios } from '~/lib/axios'
import { queryClient, type MutationConfig } from '~/lib/react-query'
import { useTranslation } from 'react-i18next'
import { useNotificationStore } from '~/stores/notifications'
import { useMutation } from '@tanstack/react-query'

export type MqttConfigDTO = {
  data: z.infer<typeof mqttConfigSchema>
  deviceId?: string
}

export const updateMqttConfig = ({ data, deviceId }: MqttConfigDTO) => {
  return axios.put(`/api/devices/${deviceId}/mqttconfig`, data)
}

type UseUpdateMqttConfigOptions = {
  config?: MutationConfig<typeof updateMqttConfig>
}

export const useUpdateMqttConfig = ({
  config,
}: UseUpdateMqttConfigOptions = {}) => {
  const { t } = useTranslation()
  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['mqttconfig'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['devices'],
      })
      addNotification({
        type: 'success',
        title: t('cloud:org_manage.device_manage.mqtt_config.update_success'),
      })
    },
    ...config,
    mutationFn: updateMqttConfig,
  })
}
