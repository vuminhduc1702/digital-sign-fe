import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { MutationConfig, queryClient } from "~/lib/react-query"
import { useNotificationStore } from "~/stores/notifications"
import { BaseAPIRes } from "~/types"
import { z } from "zod"
import { projectSchema } from "../components/CreateProject"
import { axios } from "~/lib/axios"

type CreateProjectRes = {
  data: {
    name: string,
    description: string,
    image?: string
  }
} & BaseAPIRes

export type CreateProjectDTO = {
  data: z.infer<typeof projectSchema>
}

export const createProject = ({ data }: CreateProjectDTO): Promise<CreateProjectRes> => {
  return axios.post(`/api/projects`, data)
}

export type UseCreateProjectOptions = {
  config?: MutationConfig<typeof createProject>
}

export const useCreateProject = ({ config }: UseCreateProjectOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['projects'])
      addNotification({
        type: 'success',
        title: t('cloud:project_manager.add_project.success_add'),
      })
    },
    ...config,
    mutationFn: createProject,
  })
}
