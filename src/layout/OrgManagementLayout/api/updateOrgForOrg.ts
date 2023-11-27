import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig } from '~/lib/react-query'

type UpdateOrgForOrgDTO = {
  data: {
    ids: string[]
    org_id: string
  }
}

export const updateOrgForOrg = ({ data }: UpdateOrgForOrgDTO) => {
  return axios.put(`/api/organizations/organization`, data)
}

type UseUpdateOrgForOrgOptions = {
  config?: MutationConfig<typeof updateOrgForOrg>
}

export const useUpdateOrgForOrg = ({
  config,
}: UseUpdateOrgForOrgOptions = {}) => {
  return useMutation({
    ...config,
    mutationFn: updateOrgForOrg,
  })
}
