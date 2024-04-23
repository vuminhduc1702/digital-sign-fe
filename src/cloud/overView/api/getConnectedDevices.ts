import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type Total } from '../types'

type GetConnectedDevicesDTO = {
  projectId: string
}

export const GetConnectedDevices = ({
  projectId,
}: GetConnectedDevicesDTO): Promise<Total> => {
  return axios.get(`/api/overviews/device`, {
    params: {
      project_id: projectId,
    },
  })
}

type QueryFnType = typeof GetConnectedDevices

type UseTemplateOptions = {
  config?: QueryConfig<QueryFnType>
} & GetConnectedDevicesDTO

export const useGetConnectedDevices = ({
  projectId,
  config,
}: UseTemplateOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['connected-devices', projectId],
    queryFn: () => GetConnectedDevices({ projectId }),
    ...config,
  })
}
