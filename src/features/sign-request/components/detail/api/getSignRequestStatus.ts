import { axios } from "@/lib/axios"
import { ExtractFnReturnType, QueryConfig } from "@/lib/react-query"
import { useQuery } from "@tanstack/react-query"

export type GetSignRequestStatusRes = {
    status: boolean
    signTime: Date
}

export type GetSignRequestStatusProps = {
    signRequestId: number
}

export const getSignRequestStatus = ({
    signRequestId
}: GetSignRequestStatusProps): Promise<GetSignRequestStatusRes> => {
    return axios.get(`/api/group/sign-request/${signRequestId}/status`)
}

type QueryFnType = typeof getSignRequestStatus

type UseGetSignRequestStatusOptions = {
    config?: QueryConfig<QueryFnType>
} & GetSignRequestStatusProps

export const useSignRequestStatus = ({
    signRequestId,
    config
}: UseGetSignRequestStatusOptions) => {
    return useQuery<ExtractFnReturnType<QueryFnType>>({
        queryKey: ['sign-request-status', signRequestId],
        queryFn: () => getSignRequestStatus({signRequestId}),
        ...config
    })
}
