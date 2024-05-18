import { useQuery } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '@/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { ProjectListSchema, type ProjectList } from './../routes/ProjectManage'

type GetProjects = {
  search_field?: string
  search_str?: string
}

export const getProjects = ({
  search_field,
  search_str,
}: GetProjects): Promise<ProjectList> => {
  const searchFieldArray = search_field?.split(',')
  const params = new URLSearchParams({
    search_str: search_str || '',
  })
  searchFieldArray?.forEach(field => {
    params.append('search_field', field)
  })

  return axios.get('/api/projects', { params })
}

type QueryFnType = typeof getProjects

type UseProjectsOptions = {
  config?: QueryConfig<QueryFnType>
} & GetProjects

export const useProjects = ({
  search_field,
  search_str,
  config,
}: UseProjectsOptions) => {
  const projectQuery = useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['projects', search_field, search_str],
    queryFn: () => getProjects({ search_field, search_str }),
    ...config,
  })
  return projectQuery
}
