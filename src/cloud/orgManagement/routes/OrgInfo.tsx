import { useTranslation } from 'react-i18next'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { useOrgAttrs } from '../api/getOrgAttrs'
import { useOrgIdStore } from '~/stores/org'

function OrgInfo() {
  const { t } = useTranslation()

  //TODO: remove this when we have a real orgId
  const orgId =
    useOrgIdStore(state => state.orgId) ||
    'b7c71b14-7b10-4042-8a09-4697778dcff7'
  const { data: orgAttrsData } = useOrgAttrs({ orgId })
  console.log('orgAttrsData', orgAttrsData?.attributes)

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
