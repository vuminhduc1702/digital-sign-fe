import type * as z from 'zod'
import * as zs from 'zod'
import { axios } from '@/lib/axios'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { type MutationConfig, queryClient } from '@/lib/react-query'
import { toast } from 'sonner'

import { type BaseAPIRes } from '@/types'
import { ProjectSchema } from '../routes/ProjectManage'
import i18n from '@/i18n'

type CreateProjectRes = {
  id: string
  name: string
  description: string
  image: string
  app_key: string
  app_secret: string
  sms_config: unknown
} & BaseAPIRes

export const CreateProjectSchema = ProjectSchema.pick({
  name: true,
}).merge(
  ProjectSchema.pick({
    image: true,
    description: true,
  }).partial(),
)

export const ACCEPTED_RESTORE_FILE = ['application/json', 'text/plain']
export const restoreProjectSchema = zs.object({
  file: zs
    .instanceof(File, {
      message: i18n.t('cloud:project_manager.add_project.choose_file'),
    })
    .refine(
      file => ACCEPTED_RESTORE_FILE.includes(file.type),
      i18n.t('validate:json_type'),
    ),
})

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

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['projects'])
      toast.success(t('cloud:project_manager.add_project.success_add'))
    },
    ...config,
    mutationFn: createProject,
  })
}
