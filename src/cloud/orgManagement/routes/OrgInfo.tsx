import { useTranslation } from 'react-i18next'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { useEffect, useMemo } from 'react'

import { useOrgIdStore } from '~/stores/org'
import { useProjectIdStore } from '~/stores/project'
import { useOrganizations } from '~/layout/MainLayout/api/getOrgs'
import Table from '~/components/Table'
import { flattenData, getVNDateFormat } from '~/utils/misc'
import { useOrgById } from '../api/getOrgById'
import { ComboBox } from '~/components/ComboBox'

import { type OrgAttr } from '~/layout/MainLayout/types'

import defaultOrgImage from '~/assets/images/default-org.png'
import { BtnContextMenuIcon, SearchIcon } from '~/components/SVGIcons'
import { Button } from '~/components/Button'

function OrgInfo() {
  const { t } = useTranslation()

  const projectId = useProjectIdStore(state => state.projectId)
  const { data: orgData } = useOrganizations({ projectId })
  const orgId =
    useOrgIdStore(state => state.orgId) || orgData?.organizations[0]?.id
  const {
    data: orgByIdData,
    isLoading: isLoadingOrgById,
    refetch,
  } = useOrgById({ orgId })

  useEffect(() => {
    if (orgId) {
      refetch()
    }
  }, [orgId])

  const columnHelper = createColumnHelper<OrgAttr>()

  const columns = useMemo<ColumnDef<OrgAttr, string>[]>(
    () => [
      columnHelper.accessor('id', {
        cell: info => {
          const orderId = parseInt(info.row.id) + 1
          return orderId
        },
        header: () => <span>{t('table.no')}</span>,
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

  const { acc: orgAttrFlattenData, extractedPropertyKeys } = flattenData(
    orgByIdData?.attributes as Array<OrgAttr>,
    [
      'last_update_ts',
      'attribute_key',
      'attribute_type',
      'logged',
      'value_type',
    ],
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
              src={orgByIdData?.image || defaultOrgImage}
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
            <p>{orgByIdData?.name}</p>
            <p>{orgByIdData?.description}</p>
          </div>
        </div>
      </div>
      <div className="flex grow flex-col gap-y-3">
        <h2 className="flex h-9 items-center bg-primary-400 pl-11 text-h2 uppercase text-white">
          {t('cloud.org_manage.org_info.attr_list')}
        </h2>
        <div className="flex justify-between">
          <div className="flex items-center gap-x-1">
            <Button
              className="rounded border-none"
              size="sm"
              variant="secondary"
            >
              {t('table.excel')}
            </Button>
            <Button
              className="rounded border-none"
              size="sm"
              variant="secondary"
            >
              {t('table.pdf')}
            </Button>
            <Button
              className="rounded border-none"
              size="sm"
              variant="secondary"
            >
              {t('table.print')}
            </Button>
          </div>
          {!isLoadingOrgById ? (
            <ComboBox
              data={orgAttrFlattenData}
              extractedPropertyKeys={extractedPropertyKeys}
              startIcon={
                <SearchIcon width={16} height={16} viewBox="0 0 16 16" />
              }
            />
          ) : (
            <p>Loading...</p>
          )}
        </div>
        <Table
          columns={columns}
          data={orgByIdData?.attributes}
          dataQueryKey="orgInfoData"
          contextBtn={
            <BtnContextMenuIcon
              className="cursor-pointer text-secondary-700 hover:text-primary-400"
              height={40}
              width={3}
              viewBox="0 -10 3 40"
            />
          }
        />
      </div>
    </div>
  )
}

export default OrgInfo
