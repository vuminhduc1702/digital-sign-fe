import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type Project } from '../routes/ProjectManage'

export const getProjectById = ({
  projectId,
}: {
  projectId: string
}): Promise<Project> => {
  return axios.get(`/api/projects/${projectId}`)
}

type QueryFnType = typeof getProjectById

type UseProjectByIdOptions = {
  projectId: string
  config?: QueryConfig<QueryFnType>
}

export const useProjectById = ({
  projectId,
  config,
}: UseProjectByIdOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById({ projectId }),
    ...config,
  })
}
