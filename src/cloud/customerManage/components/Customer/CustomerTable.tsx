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

function CustomerTableContextMenu({ id }: { id: string }) {
  const { t } = useTranslation()

  const navigate = useNavigate()

  const { id: projectId } = storage.getProject()

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
        <Menu.Items className="absolute right-0 z-10 mt-6 w-40 origin-top-right divide-y divide-secondary-400 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-1">
            <MenuItem
              icon={<EyeOpenIcon className="h-5 w-5" />}
              onClick={() => {
                navigate(`${PATHS.CUSTOMER_MANAGE}/${projectId}/${id}`)
              }}
            >
              {t('billing:customer_manage.info')}
            </MenuItem>
          </div>
        </Menu.Items>
      </Dropdown>
    </>
  )
}

type CustomerTableProps = {
  data?: Customer[]
} & BaseTablePagination

export function CustomerTable({ data, ...props }: CustomerTableProps) {
  const { t } = useTranslation()

  const columnHelper = createColumnHelper<Customer>()
  const columns = useMemo<ColumnDef<Customer, any>[]>(
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
    [],
  )

  return data != null && data?.length !== 0 ? (
    <BaseTable data={data} columns={columns} {...props} />
  ) : (
    <div className="flex grow items-center justify-center">
      {t('table:no_customer')}
    </div>
  )
}
