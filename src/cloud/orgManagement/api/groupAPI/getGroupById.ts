import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type Group } from '../../types'

export const getGroupById = ({
  groupId,
  get_attributes,
}: {
  groupId: string
  get_attributes?: boolean
}): Promise<Group> => {
  return axios.get(`/api/groups/${groupId}`, {
    params: { get_attributes },
  })
}

type QueryFnType = typeof getGroupById

type UseGroupByIdOptions = {
  groupId: string
  get_attributes?: boolean
  config?: QueryConfig<QueryFnType>
}

export const useGroupById = ({
  groupId,
  get_attributes = false,
  config,
}: UseGroupByIdOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['groupById', groupId, get_attributes],
    queryFn: () => getGroupById({ groupId, get_attributes }),
    ...config,
  })
}
