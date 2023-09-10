import { Menu } from '@headlessui/react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useNavigate } from 'react-router-dom'

import { Button } from '~/components/Button'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Dropdown, MenuItem } from '~/components/Dropdown'
import { BaseTable } from '~/components/Table'
import { useDisclosure } from '~/utils/hooks'
// import { UpdateDevice } from './UpdateDevice'

import { type BaseTablePagination } from '~/types'

import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { BtnContextMenuIcon } from '~/components/SVGIcons'
import { PATHS } from '~/routes/PATHS'
import storage from '~/utils/storage'
import { type EntityThing } from '~/cloud/customProtocol'
import { EntityConfigChart } from './CreateConfigChart'
import { format } from 'date-fns'

function ThingTableContextMenu({
  id,
  name,
  description,
}: {
  id: string
  name: string
  description: string
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { close, open, isOpen } = useDisclosure()

  return (
    <>
      <Dropdown
        icon={
          <BtnContextMenuIcon
            height={20}
            width={10}
            viewBox="0 0 1 20"
            className="text-secondary-700 hover:text-primary-400"
          />
        }
      >
      </Dropdown>
    </>
  )
}

type ConfigChartTableProps = {
  data: EntityConfigChart[]
} & BaseTablePagination

export function ConfigChartTable({ data, ...props }: ConfigChartTableProps) {
  const { t } = useTranslation()
  const { id: projectId } = storage.getProject()

  const columnHelper = createColumnHelper<EntityConfigChart>()
  const columns = useMemo<ColumnDef<EntityConfigChart, any>[]>(
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
      columnHelper.accessor('device', {
        header: () => (
          <span>{t('cloud:dashboard.config_chart.device')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('attr', {
        header: () => (
          <span>{t('cloud:dashboard.config_chart.attr')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('method', {
        header: () => (
          <span>{t('cloud:dashboard.config_chart.method')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'date',
        cell: info => {
          const dateFormat = info.row.original.date
          return <>
            {dateFormat?.from ? (
              dateFormat.to ? (
                <>
                  {format(dateFormat.from, "dd/MM/y")} -{" "}
                  {format(dateFormat.to, "dd/MM/y")}
                </>
              ) : (
                format(dateFormat.from, "dd/MM/y")
              )
            ) : (
              <span>{" "}</span>
            )}
          </>
        },
        header: () => <span>{t('cloud:dashboard.config_chart.date')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('color', {
        header: () => (
          <span>{t('cloud:dashboard.config_chart.color')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
    ],
    [],
  )

  return data != null && data?.length !== 0 ? (
    <BaseTable data={data} columns={columns} {...props} />
  ) : (
    <div className="flex grow items-center justify-center">
      {'Không có data'}
    </div>
  )
}
