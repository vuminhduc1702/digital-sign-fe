import { useTranslation } from 'react-i18next'
import { createColumnHelper } from '@tanstack/react-table'
import { useEffect, useMemo } from 'react'

import { useOrgAttrs } from '../api/getOrgAttrs'
import { useOrgIdStore } from '~/stores/org'
import { useProjectIdStore } from '~/stores/project'
import { useOrganizations } from '~/layout/MainLayout/api/getOrgs'
import Table from '~/components/Table'
import { getVNDateFormat } from '~/utils/misc'

import { OrgAttr } from '~/layout/MainLayout/types'

import defaultOrgImage from '~/assets/images/default-org.png'

function OrgInfo() {
  const { t } = useTranslation()

  const projectId = useProjectIdStore(state => state.projectId)
  const { data: orgData } = useOrganizations({ projectId })
  const orgId =
    useOrgIdStore(state => state.orgId) || orgData?.organizations[0]?.id
  const { data: orgAttrsData, refetch } = useOrgAttrs({ orgId })

  useEffect(() => {
    if (orgId) {
      refetch()
    }
  }, [orgId])

  const columnHelper = createColumnHelper<OrgAttr>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        cell: info => {
          const orderId = parseInt(info.row.id) + 1
          return orderId
        },
        header: () => <span>{t('cloud.org_manage.org_info.table.stt')}</span>,
        footer: info => info.column.id,
      }),
      ,
      columnHelper.accessor('attribute_key', {
        header: () => (
          <span>{t('cloud.org_manage.org_info.table.attr_key')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      // columnHelper.accessor('entity_id', {
      //   header: () => t('cloud.org_manage.org_info.table.id'),
      //   cell: info => info.getValue(),
      //   footer: info => info.column.id,
      // }),
      columnHelper.accessor('attribute_type', {
        header: () => (
          <span>{t('cloud.org_manage.org_info.table.attr_type')}</span>
        ),
        cell: info => {
          const attrType = info.getValue()
          switch (attrType) {
            case 'SCOPE_SHARE':
              return 'Share'
            case 'SCOPE_CLIENT':
              return 'Client'
            default:
              return 'Server'
          }
        },
        footer: info => info.column.id,
      }),
      columnHelper.accessor('value_type', {
        header: () => (
          <span>{t('cloud.org_manage.org_info.table.value_type')}</span>
        ),
        cell: info => {
          const valueType = info.getValue()
          switch (valueType) {
            case 'STR':
              return 'String'
            case 'BOOL':
              return 'Boolean'
            case 'LONG':
              return 'Long'
            case 'DBL':
              return 'Double'
            case 'JSON':
              return 'Json'
            default:
              return ''
          }
        },
        footer: info => info.column.id,
      }),
      columnHelper.accessor('value', {
        header: () => <span>{t('cloud.org_manage.org_info.table.value')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('last_update_ts', {
        header: () => (
          <span>{t('cloud.org_manage.org_info.table.last_update_ts')}</span>
        ),
        cell: info => getVNDateFormat(info.getValue()),
        footer: info => info.column.id,
      }),
    ],
    [],
  )

  return (
    <div className="flex grow flex-col">
      <div>
        <h2 className="flex h-9 items-center bg-primary-400 pl-11 text-h2 uppercase text-white">
          {t('cloud.org_manage.org_info.overview.title')}
        </h2>
        <div className="my-3 flex gap-6 pl-11">
          <div className="flex flex-none items-center">
            <img
              src={orgAttrsData?.image || defaultOrgImage}
              onError={e => {
                const target = e.target as HTMLImageElement
                target.onerror = null
                target.src = defaultOrgImage
              }}
              alt="Organization"
              className="h-36 w-32"
            />
          </div>
          <div className="flex flex-col gap-4">
            <p>{t('cloud.org_manage.org_info.overview.name')}</p>
            <p>{t('cloud.org_manage.org_info.overview.desc')}</p>
          </div>
          <div className="flex flex-col gap-4">
            <p>{orgAttrsData?.name}</p>
            <p>{orgAttrsData?.description}</p>
          </div>
        </div>
      </div>
      <div className="flex grow flex-col">
        <h2 className="flex h-9 items-center bg-primary-400 pl-11 text-h2 uppercase text-white">
          {t('cloud.org_manage.org_info.attr_list')}
        </h2>
        <Table
          columns={columns}
          data={orgAttrsData}
          dataQueryKey="orgInfoData"
        />
      </div>
    </div>
  )
}

export default OrgInfo
