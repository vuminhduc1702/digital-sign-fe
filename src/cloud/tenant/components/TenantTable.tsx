import { Menu } from '@headlessui/react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { Button } from '~/components/Button'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Dropdown, MenuItem } from '~/components/Dropdown'
import { BtnContextMenuIcon } from '~/components/SVGIcons'
import { BaseTable } from '~/components/Table'
import { type BaseTablePagination } from '~/types'
import { useDisclosure } from '~/utils/hooks'
import { useDeleteCustomer } from '../api/deleteTenantApi'
import { type BillingCustomerEntity } from '../types'
import { UpdateCustomer } from './UpdateTenant'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/Dropdowns'
import { ConfirmDialog } from '~/components/ConfirmDialog'

type BillingCustomerTableProps = {
  data: BillingCustomerEntity[]
} & BaseTablePagination

function CustomerTableContextMenu({
  id,
  name,
  email,
  phone,
  permissions,
}: {
  id: string
  name: string
  email: string
  phone: string
  permissions: Array<{}>
}) {
  const { t } = useTranslation()

  const { close, open, isOpen } = useDisclosure()

  const { mutate, isLoading, isSuccess } = useDeleteCustomer()
  const [type, setType] = useState('')

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="text-body-sm hover:text-primary-400 flex items-center justify-center rounded-md text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
            <BtnContextMenuIcon
              height={20}
              width={10}
              viewBox="0 0 1 20"
              className="text-secondary-700 hover:text-primary-400"
            />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              setType('edit')
              open()
            }}
          >
            <img src={btnEditIcon} alt="Edit device" className="h-5 w-5" />
            {t('form:tenant.edit')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setType('delete')
              open()
            }}
          >
            <img src={btnDeleteIcon} alt="Delete customer" className="size-5" />
            {t('form:tenant.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {isOpen && type === 'edit' ? (
        <UpdateCustomer
          customerId={id}
          name={name}
          email={email}
          phone={phone}
          close={close}
          isOpen={isOpen}
          permissions={permissions}
        />
      ) : null}

      {isOpen && type === 'delete' ? (
        <ConfirmDialog
          icon="danger"
          title={t('form:tenant.delete')}
          body={`${t('cloud:dashboard.table.delete_confirm')} ${name}`}
          close={close}
          isOpen={isOpen}
          handleSubmit={() => mutate({ id })}
          isLoading={isLoading}
        />
      ) : null}
    </>
  )
}

export function TenantTable({ data, ...props }: BillingCustomerTableProps) {
  const { t } = useTranslation()

  const columnHelper = createColumnHelper<BillingCustomerEntity>()
  const columns = useMemo<ColumnDef<BillingCustomerEntity, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => info.row.index + 1 + props.offset,
        header: () => <span>{t('table:no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('name', {
        header: () => <span>{t('table:tenant')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('phone', {
        header: () => <span>{t('table:phone')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('email', {
        header: () => <span>{t('table:email')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          const { id, name, email, phone, permissions } = info.row.original
          return CustomerTableContextMenu({
            id,
            name,
            email,
            phone,
            permissions,
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
      onDataText={t('table:no_tenant')}
      {...props}
    />
  )
}
