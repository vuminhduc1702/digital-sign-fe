import { useQuery } from '@tanstack/react-query'
import { type LWM2MResponse } from '../types'
import { axios } from '~/lib/axios'
import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'

export const getXMLdata = ({
  fileId,
}: {
  fileId: string
}): Promise<LWM2MResponse> => {

  return axios.get(`/file/publishjson/${fileId}.json`)
}

type QueryFnType = typeof getXMLdata

type UseLWM2MOptions = {
  fileId: string
  config?: QueryConfig<QueryFnType>
}

export const useGetXMLdata = ({
  fileId,
  config,
}: UseLWM2MOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['XMLdata', fileId],
    queryFn: () => getXMLdata({ fileId }),
    enabled: !!fileId,
    ...config,
  })
}