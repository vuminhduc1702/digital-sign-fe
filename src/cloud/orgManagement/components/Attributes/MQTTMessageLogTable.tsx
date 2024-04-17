import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { getVNDateFormat } from '@/utils/misc'
import { BaseTable } from '@/components/Table'

import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { type EntityType } from '../../api/attrAPI'
import { type MQTTMessage } from '../../api/attrAPI/getMQTTLog'
import { type BaseTableProps } from '@/components/Table'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/Tooltip'

export function MQTTMessageLogTable({
  data,
  entityId,
  entityType,
  ...props
}: {
  data: MQTTMessage[]
  entityId: string
  entityType: EntityType
} & BaseTableProps<MQTTMessage>) {
  const { t } = useTranslation()

  const columnHelper = createColumnHelper<MQTTMessage>()

  const dataSorted = data?.sort((a, b) => b.ts - a.ts)

  const columns = useMemo<ColumnDef<MQTTMessage, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => info.row.index + 1,
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
      columnHelper.accessor('payload_as_string', {
        header: () => (
          <span>
            {t('cloud:org_manage.device_manage.table.payload_as_string')}
          </span>
        ),
        cell: info => {
          const value = info.getValue()
          const valueTrigger =
            value?.length > 10 ? value.slice(0, 10) + '...' : value
          return (
            <>
              {value ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>{valueTrigger}</TooltipTrigger>
                    <TooltipContent>
                      <p>{value}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                ''
              )}
            </>
          )
        },
        footer: info => info.column.id,
      }),
      columnHelper.accessor('topic', {
        header: () => (
          <span>{t('cloud:org_manage.device_manage.table.topic')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
    ],
    [entityId, entityType],
  )

  return (
    <BaseTable
      popoverClassName="absolute right-0 top-1 block"
      data={dataSorted}
      columns={columns}
      onDataText={t('table:no_mqtt_hist')}
      {...props}
    />
  )
}
