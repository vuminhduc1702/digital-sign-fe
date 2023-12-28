import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

export type UpdateOrgForGroupDTO = {
  data: {
    ids: string[]
    org_id: string
  }
}

export const updateOrgForGroup = ({ data }: UpdateOrgForGroupDTO) => {
  return axios.put(`/api/groups/organization`, data)
}

type UseUpdateOrgForGroupOptions = {
  config?: MutationConfig<typeof updateOrgForGroup>
}

export const useUpdateOrgForGroup = ({
  config,
}: UseUpdateOrgForGroupOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    ...config,
    mutationFn: updateOrgForGroup,
  })
}
