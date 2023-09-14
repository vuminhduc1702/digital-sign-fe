import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'
import type * as z from 'zod'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { ProjectListSchema } from '../routes/ProjectManage'

type ProjectList = z.infer<typeof ProjectListSchema>

export const getProjects = (): Promise<ProjectList> => {
  return axios.get('/api/projects')
}

type QueryFnType = typeof getProjects

type UseProjectsOptions = {
  config?: QueryConfig<QueryFnType>
}

export const useProjects = ({ config }: UseProjectsOptions = {}) => {
  const projectQuery = useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
    ...config,
  })

  ProjectListSchema.parse(projectQuery.data)

  return projectQuery
}
