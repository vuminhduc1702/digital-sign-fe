import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'
import { type z } from 'zod'
import { type assignUserSchema } from '../../components/Group/AssignUser'

export type AssignUserDTO = {
  data: z.infer<typeof assignUserSchema>
}

export const assignUser = ({ data }: AssignUserDTO) => {
  return axios.put('/api/devices/assignForUser', data)
}

type UseAssignUserOptions = {
  config?: MutationConfig<typeof assignUser>
}

export const useAssignUser = ({ config }: UseAssignUserOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['devices'],
      })
      addNotification({
        type: 'success',
        title: t('cloud:org_manage.user_manage.add_user.success_assign'),
      })
    },
    ...config,
    mutationFn: assignUser,
  })
}
