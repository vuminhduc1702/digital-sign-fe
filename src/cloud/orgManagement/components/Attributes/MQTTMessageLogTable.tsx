import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { getVNDateFormat } from '~/utils/misc'
import { BaseTable } from '~/components/Table'

import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { type EntityType } from '../../api/attrAPI'
import { type MQTTMessage } from '../../api/attrAPI/getMQTTLog'

export function MQTTMessageLogTable({
  data,
  entityId,
  entityType,
  ...props
}: {
  data: MQTTMessage[]
  entityId: string
  entityType: EntityType
}) {
  const { t } = useTranslation()

  const columnHelper = createColumnHelper<MQTTMessage>()

  const dataSorted = data?.sort((a, b) => b.ts - a.ts)

  const columns = useMemo<ColumnDef<MQTTMessage, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => {
          const orderId = parseInt(info.row.id) + 1
          return orderId
        },
        header: () => <span>{t('table:no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('ts', {
        header: () => (
          <span>
            {t('cloud:org_manage.device_manage.table.last_update_ts')}
          </span>
        ),
        cell: info => getVNDateFormat({ date: parseInt(info.getValue()) }),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('created_by', {
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.create_by')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('owner', {
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.owner')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('topic', {
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.topic')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('project_id', {
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.project')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
    ],
    [entityId, entityType],
  )

  return data != null && data?.length !== 0 ? (
    <BaseTable
      popoverClassName="absolute right-0 top-1 block"
      data={dataSorted}
      columns={columns}
      {...props}
    />
  ) : (
    <div className="flex grow items-center justify-center">
      {t('table:no_log_attr')}
    </div>
  )
}
