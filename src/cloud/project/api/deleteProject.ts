import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { axios } from "~/lib/axios"
import { MutationConfig, queryClient } from "~/lib/react-query"
import { useNotificationStore } from "~/stores/notifications"

type DeleteProject = {
  projectId: string
}

export const deleteProject = ({ projectId }: DeleteProject) => {
  return axios.delete(
    `/api/projects/${projectId}`,
  )
}

type UseDeleteProjectOptions = {
  config?: MutationConfig<typeof deleteProject>
}

export const useDeleteProject = ({ config }: UseDeleteProjectOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['projects'])
      addNotification({
        type: 'success',
        title: t('cloud:project_manager.add_project.success_delete'),
      })
    },
    ...config,
    mutationFn: deleteProject,
  })
}
