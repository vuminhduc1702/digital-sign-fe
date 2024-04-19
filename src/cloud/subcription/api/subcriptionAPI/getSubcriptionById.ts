import { useQuery } from '@tanstack/react-query'

import { axios } from '@/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type Subcription } from '../../types'
import { type BaseAPIRes } from '@/types'

export type GetSubcriptonByIdRes = {
  data: Subcription
} & BaseAPIRes

export const getSubcriptionById = ({
  id,
}: {
  id: string
}): Promise<GetSubcriptonByIdRes> => {
  return axios.get(`/api/priceplan/subscription/detail/${id}`)
}

type QueryFnType = typeof getSubcriptionById

type UseSubcriptionByIdOptions = {
  id: string
  config?: QueryConfig<QueryFnType>
}

export const useSubcriptionById = ({
  id,
  config,
}: UseSubcriptionByIdOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['subcriptionById', id],
    queryFn: () => getSubcriptionById({ id }),
    enabled: !!id,
    ...config,
  })
}
