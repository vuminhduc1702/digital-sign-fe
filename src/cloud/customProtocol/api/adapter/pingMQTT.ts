import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '@/lib/axios'
import { toast } from 'sonner'

import { type MutationConfig } from '@/lib/react-query'

export type pingMQTTDTO = {
  data: {
    host: string
    port: string
    username: string
    password: string
  }
}

export const pingMQTT = ({
  data,
}: pingMQTTDTO): Promise<{ messsage: 'success' | 'connection time out' }> => {
  return axios.post(`/api/ping/mqtt`, data)
}

type UsePingMQTTOptions = {
  config?: MutationConfig<typeof pingMQTT>
}

export const usePingMQTT = ({ config }: UsePingMQTTOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      toast.success(t('cloud:custom_protocol.adapter.ping_MQTT.success'))
    },
    onError: async () => {
      toast.error(t('cloud:custom_protocol.adapter.ping_MQTT.failure'))
    },
    ...config,
    mutationFn: pingMQTT,
  })
}
