import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import { BaseTable } from '~/components/Table'

import { type BaseTablePagination } from '~/types'

import { type DashboardRes } from '~/cloud/dashboard/api'
import { PATHS } from '~/routes/PATHS'
import storage from '~/utils/storage'
import { StarFilledIcon } from '@radix-ui/react-icons'
import { cn, getVNDateFormat } from '~/utils/misc'


type DashboardTableProps = {
  data: DashboardRes[]
} & BaseTablePagination

export function DashboardTable({ data, ...props }: DashboardTableProps) {
  const { t } = useTranslation()
  const { id: projectId } = storage.getProject()

  const columnHelper = createColumnHelper<DashboardRes>()
  const columns = useMemo<ColumnDef<DashboardRes, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => {
          const isStar = info.row.original.dashboard_setting.starred
          return <StarFilledIcon className={cn(
            'h-5 w-5 cursor-pointer',
            {
              'text-amber-300': isStar,
              'text-white': !isStar
            }
          )} />
        },
        header: () => <span></span>,
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'name',
        header: () => <span></span>,
        cell: info => {
          const { name, id } = info.row.original
          return (
            <NavLink
              to={`${PATHS.DASHBOARD}/${projectId}/${id}`}
              className="flex cursor-pointer gap-2"
            >
              <p className="group-hover:text-primary-400 group-[.active]:text-primary-400">
                {name}
              </p>
            </NavLink>
          )
        },
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'last_viewed',
        header: () => <span></span>,
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

  return data != null && data?.length !== 0 ? (
    <BaseTable data={data} columns={columns} {...props} />
  ) : (
    <div className="flex grow items-center justify-center">
      {''}
    </div>
  )
}
