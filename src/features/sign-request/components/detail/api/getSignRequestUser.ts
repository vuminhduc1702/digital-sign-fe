import { axios } from "@/lib/axios"
import { UserDetail } from "../type"
import { ExtractFnReturnType, QueryConfig } from "@/lib/react-query"
import { useQuery } from "@tanstack/react-query"

type GetSignRequestUserRes = UserDetail[]

export type GetSignRequestUserProps = {
    signRequestId: number
}

export const getSignRequestUser = ({
    signRequestId
}: GetSignRequestUserProps): Promise<GetSignRequestUserRes> => {
    return axios.get(`/api/group/sign-request/${signRequestId}/user`)
}

type QueryFnType = typeof getSignRequestUser

type UseGetSignRequestUserOptions = {
    config?: QueryConfig<QueryFnType>
} & GetSignRequestUserProps

export const useSignRequestUser = ({
    signRequestId,
    config
}: UseGetSignRequestUserOptions) => {
    return useQuery<ExtractFnReturnType<QueryFnType>>({
        queryKey: ['sign-request-user', signRequestId],
        queryFn: () => getSignRequestUser({signRequestId}),
        ...config
    })
}
