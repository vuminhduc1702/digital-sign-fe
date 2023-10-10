import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { axios } from "~/lib/axios"
import { MutationConfig, queryClient } from "~/lib/react-query"
import { useNotificationStore } from "~/stores/notifications"

export type UpdateOrgForGroupDTO = {
  data: {
    ids?: string[],
    org_id?: string
  }
}

export const updateOrgForGroup = ({ data }: UpdateOrgForGroupDTO) => {
  return axios.put(`/api/groups/organization`, data)
}

type UseUpdateOrgForGroupOptions = {
  config?: MutationConfig<typeof updateOrgForGroup>
}

export const useUpdateOrgForGroup = ({ config }: UseUpdateOrgForGroupOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['orgs'],
      })
      // addNotification({
      //   type: 'success',
      //   title: t('cloud:org_manage.org_manage.add_org.success_update'),
      // })
    },
    ...config,
    mutationFn: updateOrgForGroup,
  })
}