import { axios } from "@/lib/axios"
import { MutationConfig, queryClient } from "@/lib/react-query"
import { BaseAPIRes } from "@/types"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

type CertRequestRes = {
} & BaseAPIRes

export const createCertRequest = (): Promise<CertRequestRes> => {
    return axios.post(`/api/certificate-request`)
}

type UseCreateCertRequestOptions = {
    config?: MutationConfig<typeof createCertRequest>
}

export const useCreateCertRequest = ({config}: UseCreateCertRequestOptions = {}) => {
    const {t} = useTranslation()
    return useMutation({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['cert-request'],
            })
            toast.success(t('request:success'))
        },
        ...config,
        mutationFn: createCertRequest
    })
}