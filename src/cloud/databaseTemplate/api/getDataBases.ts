import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { limitPagination } from '@/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type DataBaseList } from '../types'

type GetDataBases = {
  projectId: string
  offset?: number
  limit?: number
}

export const getDataBases = ({
  projectId,
}: GetDataBases): Promise<DataBaseList> => {
  return axios.get(`/api/fe/table`, {
    params: {
      project_id: projectId,
      get_index: true,
    },
  })
}

type QueryFnType = typeof getDataBases

type UseTemplateOptions = {
  config?: QueryConfig<QueryFnType>
} & GetDataBases

export const useGetDataBases = ({ projectId, config }: UseTemplateOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['dataBases', projectId],
    queryFn: () => getDataBases({ projectId }),
    ...config,
  })
}
