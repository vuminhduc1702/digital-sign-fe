import { axios } from "@/lib/axios";
import { MutationConfig, queryClient } from "@/lib/react-query";
import { BaseAPIRes } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

type CreateCertRes = {
} & BaseAPIRes

export type CreateCertProps = {
    requestId: number
    password: string
}

export const createCert = ({requestId, password}: CreateCertProps): Promise<CreateCertRes> => {
    return axios.post(`/api/certificate/${requestId}`, {
        password: password
    })
}

type UseCreateCertOptions = {
    config?: MutationConfig<typeof createCert>
}

export const useCreateCert = ({config}: UseCreateCertOptions) => {
    const {t} = useTranslation()
    return useMutation({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['cert-request'],
            })
            toast.success(t("certificate:success"))
        },
        ...config,
        mutationFn: createCert
    })
}