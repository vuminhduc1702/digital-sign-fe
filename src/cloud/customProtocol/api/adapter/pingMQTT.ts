import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { useNotificationStore } from '~/stores/notifications'

import { type MutationConfig } from '~/lib/react-query'

export type pingMQTTDTO = {
  data: {
    host: string
    port: string
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

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      addNotification({
        type: 'success',
        title: t('cloud:custom_protocol.adapter.ping_MQTT.success'),
      })
    },
    onError: async () => {
      addNotification({
        type: 'error',
        title: t('cloud:custom_protocol.adapter.ping_MQTT.failure'),
      })
    },
    ...config,
    mutationFn: pingMQTT,
  })
}
