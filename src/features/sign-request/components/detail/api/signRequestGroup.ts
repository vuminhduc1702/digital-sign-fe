import { axios } from "@/lib/axios"
import { MutationConfig, queryClient } from "@/lib/react-query"
import { BaseAPIRes } from "@/types"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

export type SignRequestGroupDTO = {
    signRequestId: number
    signatureLocation?: string,
    signatureReason?: string,
    note?: string
}

export const signRequestGroup = ({signRequestId, signatureLocation, signatureReason, note}: SignRequestGroupDTO): Promise<BaseAPIRes> => {
    return axios.post(`/api/group/sign-request/${signRequestId}/sign-group`, {
        signatureLocation: signatureLocation,
        signatureReason: signatureReason,
        note: note
    })
}

type UseSignRequestGroupOptions = {
    config?: MutationConfig<typeof signRequestGroup>
  }
  
  export const useSignRequestGroup = ({ config }: UseSignRequestGroupOptions = {}) => {
    const {t} = useTranslation()
    return useMutation({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['sign-request'],
        })
        toast.success(t('sign_request:detail_page.sign_success'))
      },
      ...config,
      mutationFn: signRequestGroup,
    })
  }