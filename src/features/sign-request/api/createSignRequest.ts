import { axios } from "@/lib/axios"
import { MutationConfig, queryClient } from "@/lib/react-query"
import { BaseAPIRes } from "@/types"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

type SignRequestRes = {
    signRequestId: number
} & BaseAPIRes

export type SignRequestDTO = {
    body: {
        groupId: number
        invalidDate: Date
    }
    files: File
}

export const createSignRequest = ({body, files}: SignRequestDTO): Promise<SignRequestRes> => {
    const formData = new FormData()
    const json = JSON.stringify(body)
    const blob = new Blob([json], {
        type: 'application/json'
    })
    formData.append('body', blob)
    formData.append('files', files)
    return axios.post(`/api/group/sign-request`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },  
    })
}

type UseCreateSignRequestOptions = {
    config?: MutationConfig<typeof createSignRequest>
}

export const useCreateSignRequest = ({config}: UseCreateSignRequestOptions = {}) => {
    const {t} = useTranslation()
    return useMutation({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['sign-request'],
            })
            toast.success(t('sign_request:success'))
        },
        ...config,
        mutationFn: createSignRequest
    })
}