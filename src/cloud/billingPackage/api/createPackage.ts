import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { queryClient, type MutationConfig } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type entityPlanSchema } from '../components'

export type CreatePlanDTO = {
  data: z.infer<typeof entityPlanSchema> & {
    project_id: string
  }
}

export const createPlan = ({
  data,
}: CreatePlanDTO) => {
  return axios.post(`/api/priceplan/plan`, data)
}

type UsecreatePlanOptions = {
  config?: MutationConfig<typeof createPlan>
}

export const useCreatePlan = ({
  config,
}: UsecreatePlanOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['plans'],
      })
      addNotification({
        type: 'success',
        title: t('billing:package_manage.popup.success_create'),
      })
    },
    ...config,
    mutationFn: createPlan,
  })
}