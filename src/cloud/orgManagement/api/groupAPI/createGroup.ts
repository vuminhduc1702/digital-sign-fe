import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

import { type Attribute } from '~/types'
import { type Group } from '../../types'

type CreateGroupRes = Omit<Group, keyof Attribute[]>

export type CreateGroupDTO = {
  data: {
    name: string
    project_id: string
    entity_type: 'ORGANIZATION' | 'DEVICE' | 'USER' | 'EVENT'
    org_id: string
  }
}

export const createGroup = ({
  data,
}: CreateGroupDTO): Promise<CreateGroupRes> => {
  return axios.post(`/api/groups`, data)
}

type UseCreateGroupOptions = {
  config?: MutationConfig<typeof createGroup>
}

export const useCreateGroup = ({ config }: UseCreateGroupOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['groups'],
      })
      toast.success(t('cloud:org_manage.group_manage.add_group.success_create'))
    },
    ...config,
    mutationFn: createGroup,
  })
}
