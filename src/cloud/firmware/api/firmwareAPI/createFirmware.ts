import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type * as z from 'zod'

import { axios } from '@/lib/axios'
import { queryClient, type MutationConfig } from '@/lib/react-query'
import { toast } from 'sonner'

import { type BaseAPIRes } from '@/types'
import { type entityFirmWareSchema } from '../../components/Firmware'

type CreateFirmWareRes = {
  data: {
    id: string
    rowsAffected: 1 | (number & NonNullable<unknown>)
  }
} & BaseAPIRes

export type CreateFirmWareDTO = {
  data: z.infer<typeof entityFirmWareSchema> & {
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

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['firm-ware'],
      })
      toast.success(t('cloud:firmware.add_firmware.success_create'))
    },
    ...config,
    mutationFn: createFirmWare,
  })
}
