import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { type z } from 'zod'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'
import { type deviceSchema } from '../../components/Device'

import { type Device } from '../../types'
import { type Attribute } from '~/types'

type CreateDeviceRes = Omit<Device, keyof Attribute[]>

export type CreateDeviceDTO = {
  data: z.infer<typeof deviceSchema>
}

export const createDevice = ({
  data,
}: CreateDeviceDTO): Promise<CreateDeviceRes> => {
  return axios.post(`/api/devices`, data)
}

type UseCreateDeviceOptions = {
  config?: MutationConfig<typeof createDevice>
}

export const useCreateDevice = ({ config }: UseCreateDeviceOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['devices'],
      })
      addNotification({
        type: 'success',
        title: t('cloud:org_manage.device_manage.add_device.success_create'),
      })
    },
    ...config,
    mutationFn: createDevice,
  })
}
