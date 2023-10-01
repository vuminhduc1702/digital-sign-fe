import { useMutation } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { queryClient, type MutationConfig } from '~/lib/react-query'

import { type EntityType } from '~/cloud/orgManagement/api/attrAPI'
import { type attrSchema } from '~/utils/schemaValidation'

export type AttributesDTO = z.infer<typeof attrSchema>

export type CreateAttrDTO = {
  data: {
    entity_ids: string[]
    entity_type: EntityType
    time_series: boolean
  }
}

type CreateAttrRes = {
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
