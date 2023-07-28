import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
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
}: pingMQTTDTO): Promise<{ messsage: 'success' | string }> => {
  return axios.post(`/api/ping/mqtt/`, data)
}

type UsePingMQTTOptions = {
  config?: MutationConfig<typeof pingMQTT>
}

export const usePingMQTT = ({ config }: UsePingMQTTOptions = {}) => {
  return useMutation({
    ...config,
    mutationFn: pingMQTT,
  })
}
