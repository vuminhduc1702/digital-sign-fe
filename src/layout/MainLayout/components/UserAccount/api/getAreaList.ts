import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'
import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'

// get province || district || ward
type GetAreaListDTO = {
  parentCode: string
  type: string
}

export const getAreaList = ({ parentCode, type }: GetAreaListDTO) => {
  return axios.get('/api/telco/getListArea', {
    params: {
      type: type,
      parentCode: parentCode,
    },
  })
}

type AreaQueryFnType = typeof getAreaList

type UseAreaList = {
  parentCode: string
  type: string
  config?: QueryConfig<AreaQueryFnType>
}

export const useAreaList = ({ config, parentCode, type }: UseAreaList) => {
  return useQuery<ExtractFnReturnType<AreaQueryFnType>>({
    queryKey: ['area-list', parentCode, type],
    queryFn: () => getAreaList({ parentCode, type }),
    ...config,
  })
}
