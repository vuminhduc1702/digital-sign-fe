import { number } from "zod"
import { Group, GroupUser } from "../types"
import { limitPagination } from "@/utils/const"
import { axios } from "@/lib/axios"
import { ExtractFnReturnType, QueryConfig } from "@/lib/react-query"
import { useQuery } from "@tanstack/react-query"

export type GetGroupUserProps = {
    groupId: number
}

export const getGroupUser = ({
    groupId
}: GetGroupUserProps): Promise<GroupUser[]> => {
    return axios.get(`/api/group/${groupId}`)
}

type QueryFnType = typeof getGroupUser

type UseGetGroupUserOptions = {
    config?: QueryConfig<QueryFnType>
} & GetGroupUserProps

export const useGetGroupUser = ({
    groupId,
    config
}: UseGetGroupUserOptions) => {
    return useQuery<ExtractFnReturnType<QueryFnType>>({
        queryKey: ['group', groupId],
        queryFn: () => getGroupUser({groupId}),
        ...config
    })
}