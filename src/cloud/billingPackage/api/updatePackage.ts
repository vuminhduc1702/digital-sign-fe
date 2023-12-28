import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

import { type entityPlanSchema } from '../components'

export type UpdatePlanDTO = {
  data: z.infer<typeof entityPlanSchema> & {
    project_id: string
  }
  planId: string
}

export const updatePlan = ({ data, planId }: UpdatePlanDTO) => {
  return axios.put(`/api/priceplan/plan/${planId}`, data)
}

type UseUpdatePlanOptions = {
  config?: MutationConfig<typeof updatePlan>
}

export const useUpdatePlan = ({
  config,
}: UseUpdatePlanOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['plans'] })
      toast.success(t('billing:package_manage.popup.success_update'))
    },
    ...config,
    mutationFn: updatePlan,
  })
}
