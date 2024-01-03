import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

import { type AttrList} from '~/utils/schemaValidation'

type UpdateAttrDTO = {
  data: {
    attributes: AttrList
  }
  entityType: string
  entityId: string
}

export const updateAttr = ({ data, entityType, entityId }: UpdateAttrDTO) => {
  return axios.put(`/api/attributes/${entityType}/${entityId}/values`, data)
}

export type UseUpdateAttrOptions = {
  config?: MutationConfig<typeof updateAttr>
}

export const useUpdateAttr = ({ config }: UseUpdateAttrOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['attrs'])
      toast.success(t('cloud:org_manage.org_manage.add_attr.success_update'))
    },
    ...config,
    mutationFn: updateAttr,
  })
}
