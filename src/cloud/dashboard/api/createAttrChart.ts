import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { queryClient, type MutationConfig } from '~/lib/react-query'

import { type EntityType } from '~/cloud/orgManagement/api/attrAPI'

import { Attribute } from '~/types'

export type CreateAttrDTO = {
  data: {
    entity_ids: string[]
    entity_type: EntityType
    time_series?: boolean
    version_two?: boolean
  }
}

type EntityKeyProps = {
  attr_keys: string[]
  entity_attrs: Attribute[]
  entity_id: string
  entity_name: string
  entity_type: string
}

type CreateAttrRes = {
  entities: EntityKeyProps[]
  keys: string[]
}

export const createAttrChart = ({
  data,
}: CreateAttrDTO): Promise<CreateAttrRes> => {
  return axios.post(`/api/attributes/datakey`, data)
}

export type UseCreateAttrOptions = {
  config?: MutationConfig<typeof createAttrChart>
}

export const useCreateAttrChart = ({ config }: UseCreateAttrOptions = {}) => {
  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['attrs-chart'])
    },
    ...config,
    mutationFn: createAttrChart,
  })
}
