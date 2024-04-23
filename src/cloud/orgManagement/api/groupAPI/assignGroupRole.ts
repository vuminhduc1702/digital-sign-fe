import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { toast } from 'sonner'
import { type z } from 'zod'
import { type assignGroupRoleSchema } from '../../components/Group/AssignGroupRole'

export type AssignGroupRoleDTO = {
  data: z.infer<typeof assignGroupRoleSchema>
}

export const assignGroupRole = ({ data }: AssignGroupRoleDTO) => {
  return axios.put('/api/users/roles', data)
}

type UseAssignGroupRoleOptions = {
  config?: MutationConfig<typeof assignGroupRole>
}

export const useAssignRoupRole = ({
  config,
}: UseAssignGroupRoleOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['users'],
      })
      toast.success(
        t('cloud:org_manage.user_manage.add_user.success_assign_role'),
      )
    },
    ...config,
    mutationFn: assignGroupRole,
  })
}
