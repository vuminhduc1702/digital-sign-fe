import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'
import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'

// get province || district || ward
type GetAreaListDTO = {
  param: {
    parentCode: string
    type: string
    queryKey: string
  }
}

export const getAreaList = ({ param }: GetAreaListDTO) => {
  return axios.get('/api/telco/getListArea', {
    params: {
      type: param.type,
      parentCode: param.parentCode,
    },
  })
}

type AreaQueryFnType = typeof getAreaList

type UseAreaList = {
  param: {
    parentCode: string
    type: string
    queryKey: string
  }
  config?: QueryConfig<AreaQueryFnType>
}

export const useAreaList = ({ config, param }: UseAreaList) => {
  return useQuery<ExtractFnReturnType<AreaQueryFnType>>({
    queryKey: [param.queryKey, param.parentCode, param],
    queryFn: () => getAreaList({ param }),
    ...config,
  })
}

