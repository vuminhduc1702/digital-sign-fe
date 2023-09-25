import { useMutation } from '@tanstack/react-query';
import axios from "axios"
import { useTranslation } from "react-i18next"
import { MutationConfig, queryClient } from "~/lib/react-query"
import { useNotificationStore } from "~/stores/notifications"
import storage from "~/utils/storage"

export type CreateDashboardItemDTO = {
  dashboardId: string,
  data: any
}

export const createDashboardItem = ({ data, dashboardId }: CreateDashboardItemDTO) => {
  return axios.put(`/api/vtdahsboard/${dashboardId}`, data)
}

export type UseCreateDashboarditemOptions = {
  config?: MutationConfig<typeof createDashboardItem>
}

export const useCreateDashboardItem = ({
  config,
}: UseCreateDashboarditemOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  const { id: projectId } = storage.getProject()

  return useMutation({
    onSuccess: async () => {
      // await queryClient.invalidateQueries(['attrs'])  
      addNotification({
        type: 'success',
        title: t('cloud:org_manage.org_manage.add_attr.success_update'),
      })
    },
    ...config,
    mutationFn: createDashboardItem,
  })
}