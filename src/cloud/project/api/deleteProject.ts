import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { axios } from "~/lib/axios"
import { MutationConfig, queryClient } from "~/lib/react-query"
import { toast } from 'sonner'

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

  return useMutation({
    onSuccess: async () => {
      toast.promise(() => queryClient.invalidateQueries(['projects']), {
        loading: t('loading:loading'),
        success: t('cloud:project_manager.add_project.success_delete'),
        error: t('error:server_res.title'),
      })
    },
    ...config,
    mutationFn: deleteProject,
  })
}
