import { useTranslation } from 'react-i18next'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { useOrgAttrs } from '../api/getOrgAttrs'
import { useOrgIdStore } from '~/stores/org'
import { useProjectIdStore } from '~/stores/project'
import { useOrganizations } from '~/layout/MainLayout/api/getOrgs'

function OrgInfo() {
  const { t } = useTranslation()

  const projectId = useProjectIdStore(state => state.projectId)
  const { data: orgData } = useOrganizations({ projectId })
  const orgId =
    useOrgIdStore(state => state.orgId) || orgData?.organizations[0].id
  const { data: orgAttrsData } = useOrgAttrs({ orgId })
  console.log('orgAttrsData', orgAttrsData)

  return (
    <div className="p-3">
      <div>{t('cloud.org_manage.org_info.overview')}</div>
      <div>
        <p>{t('cloud.org_manage.org_info.attr_list')}</p>
      </div>
    </div>
  )
}

export default OrgInfo
