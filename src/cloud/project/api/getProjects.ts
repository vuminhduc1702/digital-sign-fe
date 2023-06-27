import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'

import { type ProjectList } from '~/cloud/project'

export const getProjects = (): Promise<ProjectList> => {
  return axios.get('/api/projects')
}

type QueryFnType = typeof getProjects

type UseProjectsOptions = {
  config?: QueryConfig<QueryFnType>
}

export const useProjects = ({ config }: UseProjectsOptions = {}) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
    ...config,
  })
}
