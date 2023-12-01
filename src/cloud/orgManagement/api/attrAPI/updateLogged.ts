import { useMutation } from '@tanstack/react-query'

import { useTranslation } from 'react-i18next'
import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export type UpdateLoggedDTO = {
  data: {
    logged: boolean
  }
  device_id: string
  attribute_key: string | undefined
  entityType: string
}

export const updateLogged = ({
  data,
  entityType,
  device_id,
  attribute_key,
}: UpdateLoggedDTO) => {
  return axios.put(
    `/api/attributes/${entityType}/${device_id}/SCOPE_SERVER/${attribute_key}/logged`,
    data,
  )
}
export type UseUpdateLoggedOptions = {
  config?: MutationConfig<typeof updateLogged>
}
export const useUpdateLogged = (
  { config }: UseUpdateLoggedOptions = {},
  addNoti: boolean = true,
) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()
  return useMutation({
    onSuccess: async () => {
      if (addNoti) {
        await queryClient.invalidateQueries(['attrs'])
        addNotification({
          type: 'success',
          title: t(
            'cloud:org_manage.org_manage.add_attr.success_update_logged',
          ),
        })
      }
    },
    ...config,
    mutationFn: updateLogged,
  })
}
