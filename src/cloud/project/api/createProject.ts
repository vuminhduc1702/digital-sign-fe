import type * as z from 'zod'
import { axios } from '~/lib/axios'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type BaseAPIRes } from '~/types'
import { ProjectSchema } from '../routes/ProjectManage'

type CreateProjectRes = {
  id: string
  name: string
  description: string
  image: string
  app_key: string
  app_secret: string
  sms_config: {}
} & BaseAPIRes

export const CreateProjectSchema = ProjectSchema.pick({
  name: true,
  description: true,
}).merge(
  ProjectSchema.pick({
    image: true,
  }).partial(),
)

export type CreateProjectDTO = {
  data: z.infer<typeof CreateProjectSchema>
}

export const createProject = ({
  data,
}: CreateProjectDTO): Promise<CreateProjectRes> => {
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
