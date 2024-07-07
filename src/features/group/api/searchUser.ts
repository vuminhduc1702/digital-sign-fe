import { axios } from "@/lib/axios"
import { ExtractFnReturnType, QueryConfig } from "@/lib/react-query"
import { useQuery } from "@tanstack/react-query"

type SearchUser = {
    userId: number
    userEmail: string
}

export type SearchUserProps = {
    email: string
}

export const searchUser = ({
    email
}: SearchUserProps): Promise<SearchUser[]> => {
    return axios.get(`/api/user/search`, {
        params: {
            email: email
        }
    })
}

type QueryFnType = typeof searchUser

type UseSearchUserOptions = {
    config?: QueryConfig<QueryFnType>
} & SearchUserProps

export const useSearchUser = ({
    email,
    config
}: UseSearchUserOptions) => {
    return useQuery<ExtractFnReturnType<QueryFnType>>({
        queryKey: ['user', email],
        queryFn: () => searchUser({email}),
        ...config
    })
}