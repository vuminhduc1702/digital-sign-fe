import { axios } from "@/lib/axios"
import { SignRequestDetailType } from "../type"
import { ExtractFnReturnType, QueryConfig } from "@/lib/react-query"
import { useQuery } from "@tanstack/react-query"

export type GetSignRequestInfoProps = {
    signRequestId: number
}

export const getSignRequestInfo = ({
    signRequestId
}: GetSignRequestInfoProps): Promise<SignRequestDetailType> => {
    return axios.get(`/api/group/sign-request/${signRequestId}`)
}

type QueryFnType = typeof getSignRequestInfo

type UseGetSignRequestInfoOptions = {
    config?: QueryConfig<QueryFnType>
} & GetSignRequestInfoProps

export const useSignRequestInfo = ({
    signRequestId,
    config
}: UseGetSignRequestInfoOptions) => {
    return useQuery<ExtractFnReturnType<QueryFnType>>({
        queryKey: ['sign-request-info', signRequestId],
        queryFn: () => getSignRequestInfo({signRequestId}),
        ...config
    })
}
