import { axios } from "@/lib/axios"
import { ExtractFnReturnType, QueryConfig } from "@/lib/react-query"
import { BaseAPIRes } from "@/types"
import { useQuery } from "@tanstack/react-query"

type GetUserInfoRes = {
    userRole: number
    userId: number
    userEmail: string
    userFullName: string
} & BaseAPIRes

export const getUserInfo = async (): Promise<GetUserInfoRes> => {
    return axios.get(`/api/user/detail`)
}

type QueryFnType = typeof getUserInfo

type UseGetUserInfoOptions = {
    config?: QueryConfig<QueryFnType>
}

export const useGetUserInfo = ({
    config
}: UseGetUserInfoOptions = {}) => {
    return useQuery<ExtractFnReturnType<QueryFnType>>({
        queryKey: ['user-info'],
        queryFn: () => getUserInfo(),
        ...config
    })
}