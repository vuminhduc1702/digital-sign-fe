import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type Total } from '../types'

type GetConcurrentUserDTO = {
  projectId: string
}

export const GetConcurrentUser = ({
  projectId,
}: GetConcurrentUserDTO): Promise<Total> => {
  return axios.get(`/api/overviews/useronline`, {
    params: {
      project_id: projectId,
    },
  })
}

type QueryFnType = typeof GetConcurrentUser

type UseTemplateOptions = {
  config?: QueryConfig<QueryFnType>
} & GetConcurrentUserDTO

export const useGetConcurrentUser = ({
  projectId,
  config,
}: UseTemplateOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['concurrent-user', projectId],
    queryFn: () => GetConcurrentUser({ projectId }),
    ...config,
  })
}
