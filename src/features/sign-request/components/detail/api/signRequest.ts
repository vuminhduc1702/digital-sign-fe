import { axios } from "@/lib/axios"
import { MutationConfig, queryClient } from "@/lib/react-query"
import { BaseAPIRes } from "@/types"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

export type SignRequestDTO = {
    signRequestId: number
}

export const signRequest = ({signRequestId}: SignRequestDTO): Promise<BaseAPIRes> => {
    return axios.post(`/api/group/sign-request/${signRequestId}/sign-user`)
}

type UseSignRequestOptions = {
    config?: MutationConfig<typeof signRequest>
  }
  
  export const useSignRequest = ({ config }: UseSignRequestOptions = {}) => {
    const {t} = useTranslation()
    return useMutation({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['sign-request-info', 'sign-request-user', 'sign-request-status'],
        })
        toast.success(t('sign_request:detail_page.sign_success'))
      },
      ...config,
      mutationFn: signRequest,
    })
  }