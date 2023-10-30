import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { useNotificationStore } from "~/stores/notifications"
import { type MutationConfig, queryClient } from '~/lib/react-query'
import {type GetFuelDTO } from "../../types"
import { axios } from '~/lib/axios'


export const updateFuelAi = (data: GetFuelDTO) => {
    return axios.post(`/ai/fuel`, data)
  }

type UseUpdateFuelAi = {
    config?: MutationConfig<typeof updateFuelAi>
  }
  
export const useMutationFuelAi = ({
    config,
  }: UseUpdateFuelAi = {}) => {
    const { t } = useTranslation()
  
    const { addNotification } = useNotificationStore()
  
    return useMutation({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['call-fuel-api'],
        })
        addNotification({
          type: 'success',
          title: t('form:user.fuel'),
        })
      },
      ...config,
      mutationFn: updateFuelAi,
    })
  }