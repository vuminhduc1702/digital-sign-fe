import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { PATHS } from '~/routes/PATHS'
import { useProjectById } from '~/cloud/project/api'
import storage from '~/utils/storage'

import { type EntityTypeURL } from '../components/OrgManageSidebar'

export const deleteOrg = ({ orgId }: { orgId: string }) => {
  return axios.delete(`/api/organizations/${orgId}`)
}

type UseDeleteOrgOptions = {
  config?: MutationConfig<typeof deleteOrg>
}

export const useDeleteOrg = ({ config }: UseDeleteOrgOptions = {}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const entityTypeURL = window.location.pathname.split('/')[3] as EntityTypeURL

  const projectId = storage.getProject()?.id
  const { data: projectByIdData } = useProjectById({
    projectId,
    config: { enabled: !!projectId },
  })

  return useMutation({
    onSuccess: async () => {
      toast.promise(() => queryClient.invalidateQueries(['orgs']), {
        loading: t('loading:loading'),
        success: t('cloud:org_manage.org_manage.add_org.success_delete'),
        error: t('error:server_res.title'),
      })

      if (projectByIdData == null) {
        return navigate(PATHS.PROJECT_MANAGE)
      }
      switch (entityTypeURL) {
        case 'org':
          return navigate(`${PATHS.ORG_MANAGE}/${projectId}`)
        case 'event':
          return navigate(`${PATHS.EVENT_MANAGE}/${projectId}`)
        case 'group':
          return navigate(`${PATHS.GROUP_MANAGE}/${projectId}`)
        case 'user':
          return navigate(`${PATHS.USER_MANAGE}/${projectId}`)
        case 'device':
          return navigate(`${PATHS.DEVICE_MANAGE}/${projectId}`)
        default:
          return navigate(`${PATHS.ORG_MANAGE}/${projectId}`)
      }
    },
    ...config,
    mutationFn: deleteOrg,
  })
}
