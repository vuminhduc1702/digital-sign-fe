import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Dropdown, MenuItem } from '~/components/Dropdown'
import { BaseTable } from '~/components/Table'
import { Menu } from '@headlessui/react'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { Button } from '~/components/Button'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { BtnContextMenuIcon } from '~/components/SVGIcons'
import { type BaseTablePagination } from '~/types'
import storage from '~/utils/storage'
import { type BillingCustomerEntity } from '../types'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import { useDisclosure } from '~/utils/hooks'
import { useDeleteCustomer } from '../api/deleteCustomerApi'
import { UpdateCustomer } from './UpdateCustomer'

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
              icon={
                <img src={btnEditIcon} alt="Edit device" className="h-5 w-5" />
              }
              onClick={open}
            >
              {t('form:customer.edit')}
            </MenuItem>
            <ConfirmationDialog
              isDone={isSuccess}
              icon="danger"
              title={t('form:customer.delete')}
              body={`Bạn có chắc chắn muốn xoá ${name}`}
              triggerButton={
                <Button
                  className="w-full justify-start border-none hover:text-primary-400"
                  variant="trans"
                  size="square"
                  startIcon={
                    <img
                      src={btnDeleteIcon}
                      alt="Delete customer"
                      className="h-5 w-5"
                    />
                  }
                >
                  {t('form:customer.delete')}
                </Button>
              }
              confirmButton={
                <Button
                  isLoading={isLoading}
                  type="button"
                  size="md"
                  className="bg-primary-400"
                  onClick={() => mutate({ id })}
                  startIcon={
                    <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
                  }
                />
              }
            />
          </div>
        </Menu.Items>
      </Dropdown>
      {isOpen ? (
        <UpdateCustomer
          customerId={id}
          name={name}
          email={email}
          phone={phone}
          close={close}
          isOpen={true}
          permissions={permissions}
        />
      ) : null}
    </>
  )
}

export function BillingCustomerTable({
  data,
  ...props
}: BillingCustomerTableProps) {
  const { t } = useTranslation()

  const columnHelper = createColumnHelper<BillingCustomerEntity>()
  const columns = useMemo<ColumnDef<BillingCustomerEntity, any>[]>(
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
      columnHelper.accessor('name', {
        header: () => (
          <span>{t('billing:subcription.popup.customer_name')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('phone', {
        header: () => (
          <span>{t('cloud:org_manage.user_manage.add_user.phone')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('email', {
        header: () => <span>Email</span>,
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
    [],
  )

  return data != null && data?.length !== 0 ? (
    <BaseTable data={data} columns={columns} {...props} />
  ) : (
    <div className="flex grow items-center justify-center">
      {t('table:no_thing')}
    </div>
  )
}