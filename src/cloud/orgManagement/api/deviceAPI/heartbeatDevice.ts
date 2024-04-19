import { useMutation } from '@tanstack/react-query'

import { useTranslation } from 'react-i18next'
import { type z } from 'zod'
import { axios } from '@/lib/axios'
import { queryClient, type MutationConfig } from '@/lib/react-query'
import { toast } from 'sonner'
import { type heartBeatSchema } from '../../components/Device/UpdateDevice'

export type HeartBeatDTO = {
  data: z.infer<typeof heartBeatSchema>
  deviceId?: string
}

export const heartBeat = ({ data, deviceId }: HeartBeatDTO) => {
  return axios.put(`/api/devices/additional/${deviceId}`, data)
}
export const updateHeartBeat = ({ deviceId }: { deviceId: string }) => {
  return axios.get(`/api/devices/heartbeat/${deviceId}`)
}

type UseHeartBeatOptions = {
  config?: MutationConfig<typeof heartBeat>
}
type UseUpdateHeartBeatOptions = {
  config?: MutationConfig<typeof updateHeartBeat>
}

export const useHeartBeat = ({ config }: UseHeartBeatOptions = {}) => {
  const { t } = useTranslation()
  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['heartbeat'],
      })
      queryClient.invalidateQueries({
        queryKey: ['devices'],
      })
      toast.success(
        t('cloud:org_manage.device_manage.add_device.success_heartbeat'),
      )
    },
    ...config,
    mutationFn: heartBeat,
  })
}

export const useUpdateHeartBeat = ({
  config,
}: UseUpdateHeartBeatOptions = {}) => {
  const { t } = useTranslation()
  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['heartbeat'],
      })
      queryClient.invalidateQueries({
        queryKey: ['devices'],
      })
      toast(t('cloud:org_manage.device_manage.add_device.success_heartbeat'))
    },
    ...config,
    mutationFn: updateHeartBeat,
  })
}
