import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'

import { type Project } from '../types'

export const getProjects = (): Promise<Project[]> => {
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
