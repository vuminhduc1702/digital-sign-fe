import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { queryClient, type MutationConfig } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type BaseAPIRes } from '~/types'
import { type entityFirmWareSchema } from '../../components/Firmware'

type CreateFirmWareRes = {
  data: {
    id: string
    rowsAffected: 1 | number
  }
} & BaseAPIRes

export type CreateFirmWareDTO = {
  data: z.infer<typeof entityFirmWareSchema>
  &{
    project_id: string
  }
}

export const createFirmWare = ({
  data,
}: CreateFirmWareDTO): Promise<CreateFirmWareRes> => {
  return axios.post(`/api/ota`, data)
}

type UseCreateFirmWareOptions = {
  config?: MutationConfig<typeof createFirmWare>
}

export const useCreateFireWare = ({
  config,
}: UseCreateFirmWareOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['firm-ware'],
      })
      addNotification({
        type: 'success',
        title: t('cloud:firmware.add_firmware.success_create'),
      })
    },
    ...config,
    mutationFn: createFirmWare,
  })
}
