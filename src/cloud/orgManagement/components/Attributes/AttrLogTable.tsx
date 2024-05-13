import { useMemo, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { getVNDateFormat } from '@/utils/misc'
import { BaseTable } from '@/components/Table'
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { type DeviceAttrLog, type EntityType } from '../../api/attrAPI'
import { type BaseTablePagination } from '@/types'

type AttrLogTableProps = {
  data: DeviceAttrLog[]
  entityId: string
  entityType: EntityType
  rowSelection: { [key: string]: boolean }
  setRowSelection: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >
  formatExcel?: (data: DeviceAttrLog[]) => any
  pdfHeader?: string[]
  isSearchData?: boolean
} & BaseTablePagination

export function AttrLogTable({
  data,
  entityId,
  entityType,
  ...props
}: AttrLogTableProps) {
  const { t } = useTranslation()

  const columnHelper = createColumnHelper<DeviceAttrLog>()

  const dataSorted = data?.sort((a, b) => b.ts - a.ts)

  const offsetPrev = useRef<number>(props.offset)

  useEffect(() => {
    if (props.isPreviousData && offsetPrev.current < props.offset) {
      offsetPrev.current = props.offset
    }
  }, [props.isPreviousData])

  const columns = useMemo<ColumnDef<DeviceAttrLog, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => info.row.index + 1 + props.offset,
        header: () => <span>{t('table:no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('ts', {
        header: () => (
          <span>{t('cloud:org_manage.org_manage.table.last_update_ts')}</span>
        ),
        cell: info => getVNDateFormat({ date: parseInt(info.getValue()) }),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('attribute_key', {
        header: () => (
          <span>{t('cloud:org_manage.org_manage.table.attr_key')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('value', {
        header: () => (
          <span>{t('cloud:org_manage.org_manage.table.value')}</span>
        ),
        cell: info => {
          const value = JSON.stringify(info.getValue())
          const valueTrigger =
            value?.length > 10 ? value.slice(0, 10) + '...' : value

          if (JSON.parse(value) === '') return undefined

          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>{valueTrigger}</TooltipTrigger>
                <TooltipContent>
                  <p>{value}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        },
        footer: info => info.column.id,
      }),
    ],
    [entityId, entityType, props.offset],
  )

  return (
    <BaseTable
      popoverClassName="absolute right-0 top-1 block"
      data={dataSorted}
      columns={columns}
      onDataText={t('table:no_log_attr')}
      {...props}
    />
  )
}
