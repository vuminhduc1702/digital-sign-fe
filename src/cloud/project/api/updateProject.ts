import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export type UpdateProjectDTO = {
  data: {
    name?: string
    description?: string
    image?: string
  }
  projectId: string
}

export const updateProject = ({ data, projectId }: UpdateProjectDTO) => {
  return axios.put(`/api/projects/${projectId}`, data)
}

export type UseUpdateProjectOptions = {
  config?: MutationConfig<typeof updateProject>
}

export const useUpdateProject = ({ config }: UseUpdateProjectOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['projects'])
      addNotification({
        type: 'success',
        title: t('cloud:project_manager.add_project.success_update'),
      })
    },
    ...config,
    mutationFn: updateProject,
  })
}
