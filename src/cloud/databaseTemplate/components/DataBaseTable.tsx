import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DashboardRes } from '~/cloud/dashboard/api'
import { Link } from '~/components/Link'
import { BaseTable } from '~/components/Table'
import { PATHS } from '~/routes/PATHS'
import { getVNDateFormat } from '~/utils/misc'

export function DataBaseTable({
  columnsProp,
  data,
  ...props
}: {
  columnsProp: string[]
  data: any[]
}) {
  const { t } = useTranslation()

  const columnHelper = createColumnHelper<any>()

  console.log(columnsProp, 'columnsProp')

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => columnsProp?.map(item => (
      columnHelper.accessor(item, {
        header: () => (
          <span>{(item)}</span>
        ),
        cell: info => info?.getValue(),
        footer: info => info.column.id,
      })
    )),
    [columnsProp],
  )

  return  (
    <BaseTable
      popoverClassName="absolute right-0 top-1 block"
      data={data}
      columns={columns}
      {...props}
    />
  )
}
