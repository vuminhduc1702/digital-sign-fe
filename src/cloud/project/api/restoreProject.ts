import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { uploadImage } from '@/layout/OrgManagementLayout/api'
import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { toast } from 'sonner'

export type RestoreProjectRes = {
  data: string
}

export type RestoreProjectDTO = {
  projectId: string
  backup: any
}

export const restoreProject = ({
  projectId,
  backup,
}: RestoreProjectDTO): Promise<RestoreProjectRes> => {
  return axios.post(`/api/projects/restore/${projectId}`, backup)
}

type UseUploadImageOptions = {
  type?: string
  config?: MutationConfig<typeof restoreProject>
}

export const useRestoreProject = ({
  type,
  config,
}: UseUploadImageOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['restore-project'],
      })
      toast.success(t('cloud:project_manager.add_project.success_restore'))
    },
    ...config,
    mutationFn: restoreProject,
  })
}
