import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { useNotificationStore } from "~/stores/notifications"
import { type MutationConfig, queryClient } from '~/lib/react-query'
import {type GetDdosDTO } from "../../types"
import { axios } from '~/lib/axios'


export const updateDdosAi = (data: GetDdosDTO) => {
    return axios.post(`/ai/ddos`, data)
  }

type UseUpdateDdosAi = {
    config?: MutationConfig<typeof updateDdosAi>
  }
  
export const useMutationDdosAi = ({
    config,
  }: UseUpdateDdosAi = {}) => {
    const { t } = useTranslation()
  
    const { addNotification } = useNotificationStore()
  
    return useMutation({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['call-ddos-api'],
        })
        addNotification({
          type: 'success',
          title: t('form:user.ddos'),
        })
      },
      ...config,
      mutationFn: updateDdosAi,
    })
  }