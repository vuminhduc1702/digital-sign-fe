import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

export const deleteThing = ({ id }: { id: string }) => {
  return axios.delete(`/api/fe/thing/${id}`)
}

type UseDeleteThingOptions = {
  config?: MutationConfig<typeof deleteThing>
}

export const useDeleteThing = ({ config }: UseDeleteThingOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      toast.promise(() => queryClient.invalidateQueries(['entity-things']), {
        loading: t('loading:loading'),
        success: t('cloud:custom_protocol.thing.success_delete'),
        error: t('error:server_res.title'),
      })
    },
    ...config,
    mutationFn: deleteThing,
  })
}
