import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type Total } from '../types'

type GetRegistedUserDTO = {
  projectId: string
}

export const GetRegistedUser = ({
  projectId,
}: GetRegistedUserDTO): Promise<Total> => {
  return axios.get(`/api/overviews/enduser`, {
    params: {
      project_id: projectId,
    },
  })
}

type QueryFnType = typeof GetRegistedUser

type UseTemplateOptions = {
  config?: QueryConfig<QueryFnType>
} & GetRegistedUserDTO

export const useGetRegistedUser = ({
  projectId,
  config,
}: UseTemplateOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['registed-user', projectId],
    queryFn: () => GetRegistedUser({ projectId }),
    ...config,
  })
}
