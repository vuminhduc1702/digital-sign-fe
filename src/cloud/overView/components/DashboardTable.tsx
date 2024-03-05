import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { BaseTable } from '~/components/Table'
import { Link } from '~/components/Link'
import { PATHS } from '~/routes/PATHS'
import storage from '~/utils/storage'
import { cn, getVNDateFormat } from '~/utils/misc'

import { type BaseTablePagination } from '~/types'
import { type DashboardRes } from '~/cloud/dashboard/api'

import { StarFilledIcon } from '@radix-ui/react-icons'

type DashboardTableProps = {
  data: DashboardRes[]
  isHiddenCheckbox: boolean
} & BaseTablePagination

export function DashboardTable({ data, ...props }: DashboardTableProps) {
  const { t } = useTranslation()

  const projectId = storage.getProject()?.id

  const columnHelper = createColumnHelper<DashboardRes>()
  const columns = useMemo<ColumnDef<DashboardRes, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        header: () => <span>{t('table:starred')}</span>,
        cell: info => {
          const isStar = info.row.original.dashboard_setting.starred
          return (
            <StarFilledIcon
              className={cn('mx-auto h-5 w-5 cursor-pointer', {
                'text-amber-300': isStar,
                'text-white': !isStar,
              })}
            />
          )
        },
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'name',
        header: () => <span>{t('cloud:dashboard.table.name')}</span>,
        cell: info => info.row.original,
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'last_viewed',
        header: () => <span>{t('table:last_updated')}</span>,
        cell: info => {
          const lastViewed = info.row.original.dashboard_setting.last_viewed
          return (
            <span>{getVNDateFormat({ date: Date.parse(lastViewed) })}</span>
          )
        },
        footer: info => info.column.id,
      }),
    ],
    [],
  )

  return (
    <BaseTable
      data={data}
      columns={columns}
      isAbsoluteBtn={false}
      onDataText={t('table:no_dashboard')}
      path={PATHS.DASHBOARD}
      projectId={projectId}
      {...props}
    />
  )
}
