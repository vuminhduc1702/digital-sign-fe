import { useQuery } from '@tanstack/react-query'
import { type Org } from '~/layout/MainLayout/types'
import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'

export const getEvent = (): Promise<Org[]> => {
  return axios.get('/api/events/', {
    params: { project_id: 'a802cfe5-ae6b-4381-97ab-494b9277ea63' },
  })
}

type QueryFnType = typeof getEvent

type UseEventOptions = {
  config?: QueryConfig<QueryFnType>
}

export const useEvent = ({ config }: UseEventOptions = {}) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    ...config,
    queryKey: ['event'],
    queryFn: () => getEvent(),
  })
}
