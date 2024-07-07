import { limitPagination } from "@/utils/const"
import { SignRequest } from "../types"
import { axios } from "@/lib/axios"
import { ExtractFnReturnType, QueryConfig } from "@/lib/react-query"
import { useQuery } from "@tanstack/react-query"

export type SignRequestRes = {
    data: SignRequest[]
    meta: {
        page: number
        limit: number
        total: number
    }
}

export type GetSignRequestProps = {
    pageNum?: number
    pageSize?: number
    create?: boolean
}

export const getSignRequest = ({
    pageNum = 1,
    pageSize = limitPagination,
    create = true
}: GetSignRequestProps): Promise<SignRequestRes> => {
    return axios.get(`/api/group/sign-request`, {
        params: {
            pageNum: pageNum,
            pageSize: pageSize,
            create: create
        }
    })
}

type QueryFnType = typeof getSignRequest

type UseGetSignRequestOptions = {
    config?: QueryConfig<QueryFnType>
} & GetSignRequestProps

export const useGetSignRequest = ({
    pageNum,
    pageSize,
    create,
    config
}: UseGetSignRequestOptions) => {
    return useQuery<ExtractFnReturnType<QueryFnType>>({
        queryKey: ['sign-request', pageNum, pageSize, create],
        queryFn: () => getSignRequest({pageNum, pageSize, create}),
        ...config
    })
}