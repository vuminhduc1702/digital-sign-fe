import { limitPagination } from "@/utils/const"
import { CertificateRequest } from "../types"
import { axios } from "@/lib/axios"
import { ExtractFnReturnType, QueryConfig } from "@/lib/react-query"
import { useQuery } from "@tanstack/react-query"

type GetCertRequestRes = {
    data: CertificateRequest[]
    meta: {
        page: number
        limit: number
        total: number
    }
}

export type GetCertRequestProps = {
    pageNum?: number
    pageSize?: number
    status?: number
}

export const getCertRequest = ({
    pageNum = 1,
    pageSize = limitPagination,
    status = 0
}: GetCertRequestProps): Promise<GetCertRequestRes> => {
    return axios.get(`/api/certificate-request`, {
        params: {
            pageNum: pageNum,
            pageSize: pageSize,
            status: status
        }
    })
}

type QueryFnType = typeof getCertRequest

type UseGetCertRequestOptions = {
    config?: QueryConfig<QueryFnType>
} & GetCertRequestProps

export const useGetCertRequest = ({
    pageNum,
    pageSize,
    status,
    config
}: UseGetCertRequestOptions) => {
    return useQuery<ExtractFnReturnType<QueryFnType>>({
        queryKey: ['cert-request', pageNum, pageSize, status],
        queryFn: () => getCertRequest({pageNum, pageSize, status}),
        ...config
    })
}