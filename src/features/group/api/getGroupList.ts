import { number } from "zod"
import { Group } from "../types"
import { limitPagination } from "@/utils/const"
import { axios } from "@/lib/axios"
import { ExtractFnReturnType, QueryConfig } from "@/lib/react-query"
import { useQuery } from "@tanstack/react-query"

export type GetGroupListRes = {
    data: Group[]
    meta: {
        page: number
        limit: number
        total: number
    }
}

export type GetGroupListProps = {
    pageNum?: number
    pageSize?: number
}

export const getGroupList = ({
    pageNum = 1,
    pageSize = limitPagination
}: GetGroupListProps): Promise<GetGroupListRes> => {
    return axios.get(`/api/group`, {
        params: {
            pageNum: pageNum,
            pageSize: pageSize
        }
    })
}

type QueryFnType = typeof getGroupList

type UseGetGroupListOptions = {
    config?: QueryConfig<QueryFnType>
} & GetGroupListProps

export const useGetGroupList = ({
    pageNum,
    pageSize,
    config
}: UseGetGroupListOptions) => {
    return useQuery<ExtractFnReturnType<QueryFnType>>({
        queryKey: ['group', pageNum, pageSize],
        queryFn: () => getGroupList({pageNum, pageSize}),
        ...config
    })
}