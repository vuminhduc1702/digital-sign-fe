import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { queryClient, type MutationConfig } from '~/lib/react-query'
import { toast } from 'sonner'

import { type BaseAPIRes } from '~/types'
import { type entitySubcriptionSchema } from '../../components/Subcription'

type CreateSubcriptionRes = {
  data: {
    id: string
    rowsAffected: 1 | number
  }
} & BaseAPIRes

export type CreateSubcriptionDTO = {
  data: z.infer<typeof entitySubcriptionSchema>
  &{
    project_id: string
  }
}

export const createSubcription = ({
  data,
}: CreateSubcriptionDTO): Promise<CreateSubcriptionRes> => {
  return axios.post(`/api/priceplan/subscription`, data)
}

type UseCreateSubcriptionOptions = {
  config?: MutationConfig<typeof createSubcription>
}

export const useCreateSubcription = ({
  config,
}: UseCreateSubcriptionOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['subcriptions'],
      })
      toast.success(t('billing:subcription.popup.success_create'))
    },
    ...config,
    mutationFn: createSubcription,
  })
}
