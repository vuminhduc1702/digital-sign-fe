import { useMutation } from "@tanstack/react-query"
import { uploadImage } from "~/layout/OrgManagementLayout/api"
import { axios } from "~/lib/axios"
import { MutationConfig, queryClient } from "~/lib/react-query"

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
  config?: MutationConfig<typeof restoreProject>
}

export const useRestoreProject = ({ config }: UseUploadImageOptions = {}) => {
  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['restore-project'],
      })
    },
    ...config,
    mutationFn: restoreProject,
  })
}