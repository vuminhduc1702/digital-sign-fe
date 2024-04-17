import { useQuery } from '@tanstack/react-query'

import { axios } from '@/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type Billing } from '../../types'
import { type BaseAPIRes } from '@/types'

export type GetBillingByIdRes = {
  data: Billing
} & BaseAPIRes

export const getBillingById = ({
  id,
}: {
  id: string
}): Promise<GetBillingByIdRes> => {
  return axios.get(`/api/priceplan/bill/${id}`)
}

type QueryFnType = typeof getBillingById

type UseBillingByIdOptions = {
  id: string
  config?: QueryConfig<QueryFnType>
}

export const useBillingById = ({ id, config }: UseBillingByIdOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['billingById', id],
    queryFn: () => getBillingById({ id }),
    enabled: !!id,
    ...config,
  })
}
