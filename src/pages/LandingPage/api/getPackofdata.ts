import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { axios } from '~/lib/axios'
import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'

export const PackofDataSchema = z.object({
  name: z.string(),
  fee: z.string(),
  categoryName: z.string(),
  discountPromotionData: z.string(),
  discountPromotionSMS: z.string(),
  freeChargingCycle: z.string(),
  monthlyFee: z.string(),
  offerCode: z.string(),
  offerType: z.string(),
  payType: z.string(),
  category: z.string(),
})

type GetPackofdata = {
  offerType?: string
  payType?: string
  category?: string
}
export type packofDataDTO = { data: z.infer<typeof PackofDataSchema> }

export const getPackofdata = ({
  offerType,
  payType,
  category,
}: GetPackofdata): Promise<packofDataDTO> => {
  return axios.get('/api/telco/offerM2M', {
    params: {
      offerType,
      payType,
      category,
    },
  })
}

type QueryFnType = typeof getPackofdata

type UseGetPackofdata = {
  config?: QueryConfig<QueryFnType>
} & GetPackofdata

export const useGetPackofdata = ({
  offerType,
  payType,
  category,
  config,
}: UseGetPackofdata) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['packofdata', offerType, payType, category],
    queryFn: () => getPackofdata({ offerType, payType, category }),
    ...config,
  })
}
