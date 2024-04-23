import { type z } from 'zod'
import { type mqttConfigSchema } from '../../components/Device/UpdateMqttConfig'
import { axios } from '@/lib/axios'
import { queryClient, type MutationConfig } from '@/lib/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
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

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['mqttconfig'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['devices'],
      })
      toast.success(
        t('cloud:org_manage.device_manage.mqtt_config.update_success'),
      )
    },
    ...config,
    mutationFn: updateMqttConfig,
  })
}
