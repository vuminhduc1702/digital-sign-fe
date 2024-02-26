import { Menu } from '@headlessui/react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Dropdown, MenuItem } from '~/components/Dropdown'
import { BaseTable } from '~/components/Table'

import { type BaseTablePagination } from '~/types'

import { EyeOpenIcon } from '@radix-ui/react-icons'
import { useNavigate } from 'react-router-dom'
import { BtnContextMenuIcon } from '~/components/SVGIcons'
import { PATHS } from '~/routes/PATHS'
import storage from '~/utils/storage'
import { type Customer } from '../../types'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/Dropdowns'

function CustomerTableContextMenu({ id }: { id: string }) {
  const { t } = useTranslation()

  const navigate = useNavigate()

  const projectId = storage.getProject()?.id

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex items-center justify-center rounded-md text-body-sm text-white hover:bg-opacity-30 hover:text-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
            <BtnContextMenuIcon
              height={20}
              width={10}
              viewBox="0 0 1 20"
              className="text-secondary-700 hover:text-primary-400"
            />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <div className='flex gap-x-2 hover:text-primary-300'
              onClick={() => {
                navigate(`${PATHS.CUSTOMER_MANAGE}/${projectId}/${id}`)
              }}>
              <EyeOpenIcon className="h-5 w-5" />
              {t('billing:customer_manage.info')}
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

type CustomerTableProps = {
  data?: Customer[]
  rowSelection: { [key: string]: boolean }
  setRowSelection: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >
} & BaseTablePagination

export function CustomerTable({ data, ...props }: CustomerTableProps) {
  const { t } = useTranslation()

  const columnHelper = createColumnHelper<Customer>()
  const columns = useMemo<ColumnDef<Customer, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => info.row.index + 1 + props.offset,
        header: () => <span>{t('table:no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('customer_code', {
        header: () => (
          <span>{t('billing:customer_manage.table.customer_code')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('name', {
        header: () => (
          <span>{t('billing:customer_manage.table.customer_name')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('phone', {
        header: () => <span>{t('billing:customer_manage.table.phone')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('email', {
        header: () => <span>{t('billing:customer_manage.table.email')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('role_name', {
        header: () => <span>{t('billing:customer_manage.table.role')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('org_name', {
        header: () => <span>{t('billing:customer_manage.table.parent')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          const { user_id } = info.row.original
          return CustomerTableContextMenu({
            id: user_id,
          })
        },
        header: () => null,
        footer: info => info.column.id,
      }),
    ],
    [props.offset],
  )

  return (
    <BaseTable
      data={data}
      columns={columns}
      onDataText={t('table:no_customer')}
      {...props}
    />
  )
}
