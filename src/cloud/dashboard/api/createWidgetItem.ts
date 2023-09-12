import { useMutation } from '@tanstack/react-query';
import axios from "axios"
import { useTranslation } from "react-i18next"
import { MutationConfig, queryClient } from "~/lib/react-query"
import { useNotificationStore } from "~/stores/notifications"
import storage from "~/utils/storage"

export type CreateWidgetItemDTO = {
  dashboardId: string,
  data: any
}

export const createWidgetItem = ({ data, dashboardId }: CreateWidgetItemDTO) => {
  return axios.put(`/api/vtdahsboard/${dashboardId}`, data)
}

export type UseCreateWidgetItemOptions = {
  config?: MutationConfig<typeof createWidgetItem>
}

export const useCreateWidgetItem = ({
  config,
}: UseCreateWidgetItemOptions = {}) => {
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
    mutationFn: createWidgetItem,
  })
}