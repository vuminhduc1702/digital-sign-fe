import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type * as z from 'zod'

import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { toast } from 'sonner'

import { type CreateProjectSchema } from './createProject'

export type UpdateProjectDTO = {
  data: z.infer<typeof CreateProjectSchema>
  projectId: string
}

export const updateProject = ({ data, projectId }: UpdateProjectDTO) => {
  return axios.put(`/api/projects/${projectId}`, data)
}

export type UseUpdateProjectOptions = {
  config?: MutationConfig<typeof updateProject>
  isOnCreateProject?: boolean
}

export const useUpdateProject = ({
  config,
  isOnCreateProject,
}: UseUpdateProjectOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['projects'])
      !isOnCreateProject &&
        toast.success(t('cloud:project_manager.add_project.success_update'))
    },
    ...config,
    mutationFn: updateProject,
  })
}
