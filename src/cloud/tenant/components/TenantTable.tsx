import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo, useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import btnEditIcon from '@/assets/icons/btn-edit.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { Button } from '@/components/ui/button'

import { BtnContextMenuIcon } from '@/components/SVGIcons'
import { BaseTable, type BaseTableProps } from '@/components/Table'
import { type BaseTablePagination } from '@/types'
import { useDisclosure } from '@/utils/hooks'
import { useDeleteCustomer } from '../api/deleteTenantApi'
import { type BillingCustomerEntity } from '../types'
import { UpdateCustomer } from './UpdateTenant'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { LuEye, LuPen, LuTrash2, LuMoreVertical, LuFiles } from 'react-icons/lu'

type PartialBaseTableProps<T> = Omit<
  BaseTableProps<BillingCustomerEntity>,
  'columns'
> & {
  columns?: ColumnDef<T, any>[]
}

type BillingCustomerTableProps = {
  data: BillingCustomerEntity[]
} & PartialBaseTableProps<BillingCustomerEntity>

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
  const {
    close: closeDelete,
    open: openDelete,
    isOpen: isOpenDelete,
  } = useDisclosure()

  const { mutate, isLoading, isSuccess } = useDeleteCustomer()

  return (
    <>
      <div className="flex">
        <div className="flex cursor-pointer justify-center p-3">
          <LuPen
            className="text-lg text-gray-500 transition-all duration-200 ease-in-out hover:scale-125 hover:text-black"
            onClick={open}
          />
        </div>
        <div className="flex cursor-pointer justify-center p-3">
          <LuTrash2
            className="text-lg text-gray-500 transition-all duration-200 ease-in-out hover:scale-125 hover:text-black"
            onClick={openDelete}
          />
        </div>
      </div>
      <UpdateCustomer
        customerId={id}
        name={name}
        email={email}
        phone={phone}
        close={close}
        isOpen={isOpen}
        permissions={permissions}
      />
      <ConfirmDialog
        icon="danger"
        title={t('form:tenant.delete')}
        body={`${t('cloud:dashboard.table.delete_confirm')} ${name}`}
        close={closeDelete}
        isOpen={isOpenDelete}
        isSuccessDelete={isSuccess}
        handleSubmit={() => mutate({ id })}
        isLoading={isLoading}
      />
    </>
  )
}

export function TenantTable({ data, ...props }: BillingCustomerTableProps) {
  const { t } = useTranslation()

  const offsetPrev = useRef<number>(props.offset)

  useEffect(() => {
    if (props.isPreviousData && offsetPrev.current < props.offset) {
      offsetPrev.current = props.offset
    }
  }, [props.isPreviousData])

  const columnHelper = createColumnHelper<BillingCustomerEntity>()
  const columns = useMemo<ColumnDef<BillingCustomerEntity, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => {
          return !props.isPreviousData
            ? info.row.index + 1 + props.offset
            : info.row.index + 1 + offsetPrev.current
        },
        header: () => <span>{t('table:no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('name', {
        header: () => <span>{t('cloud:tenant.table.tenant')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('phone', {
        header: () => <span>{t('cloud:tenant.table.phone')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('email', {
        header: () => <span>{t('cloud:tenant.table.email')}</span>,
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
