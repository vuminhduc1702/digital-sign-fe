import { useTranslation } from 'react-i18next'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { BaseTable } from '~/components/Table'
import { useDisclosure } from '~/utils/hooks'
import { Dropdown, MenuItem } from '~/components/Dropdown'
import { BtnContextMenuIcon } from '~/components/SVGIcons'
import { Menu } from '@headlessui/react'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Button } from '~/components/Button'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import { type BaseTablePagination } from '~/types'
import { type CustomerRoleEntity } from '../types'
import { useDeleteCustomerRole } from '../api/deleteCustomerRoleApi'
import { UpdateCustomerRole } from './UpdateCustomerRole'

type CustomerRoleTableProps = {
  data: CustomerRoleEntity[]
} & BaseTablePagination

function CustomerTableContextMenu({
  project_id,
  name,
  role_id: roleIdProps,
  customerId: sub_tenant_id,
}: {
  project_id: string
  role_id: string
  name: string
  customerId: string
}) {
  const { t } = useTranslation()

  const {
    close: closeEdit,
    open: openEdit,
    isOpen: isOpenEdit,
  } = useDisclosure()

  const { mutate, isLoading, isSuccess } = useDeleteCustomerRole()
  console.log(project_id, 'check projectID')

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
            <Button
              className="w-full justify-start border-none hover:text-primary-400"
              variant="trans"
              size="square"
              startIcon={
                <img
                  src={btnEditIcon}
                  alt="Edit customer role"
                  className="h-5 w-5"
                />
              }
              onClick={openEdit}
            >
              {t('form:role.edit')}
            </Button>
            <ConfirmationDialog
              isDone={isSuccess}
              icon="danger"
              title={t('form:role.delete')}
              body={`Bạn có chắc chắn muốn xoá ${name}`}
              triggerButton={
                <Button
                  className="w-full justify-start border-none hover:text-primary-400"
                  variant="trans"
                  size="square"
                  startIcon={
                    <img
                      src={btnDeleteIcon}
                      alt="Delete customer role"
                      className="h-5 w-5"
                    />
                  }
                >
                  {t('form:role.delete')}
                </Button>
              }
              confirmButton={
                <Button
                  isLoading={isLoading}
                  type="button"
                  size="md"
                  className="bg-primary-400"
                  onClick={() => mutate({ project_id, sub_tenant_id })}
                  startIcon={
                    <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
                  }
                />
              }
            />
          </div>
        </Menu.Items>
      </Dropdown>
      {isOpenEdit ? (
        <UpdateCustomerRole
          project_id={project_id}
          roleIdProps={roleIdProps}
          modalTitle="Sửa quyền"
          isOpenRole={true}
          customerId={sub_tenant_id}
          closeRole={closeEdit}
        />
      ) : null}
    </>
  )
}

export function CustomerRoleTable({ data, ...props }: CustomerRoleTableProps) {
  const { t } = useTranslation()
  const { customerId } = props.otherData

  console.log(data, customerId, 'check data permission')
  const columnHelper = createColumnHelper<CustomerRoleEntity>()
  const columns = useMemo<ColumnDef<CustomerRoleEntity, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => {
          const orderId = parseInt(info.row.id) + 1
          return <div className="text-left">{orderId}</div>
        },
        header: () => <span>{t('table:no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('project_id', {
        header: () => <span>Project</span>,
        cell: info => <div className="text-left">{info.getValue()}</div>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('role_id', {
        header: () => <span>Role</span>,
        cell: info => <div className="text-left">{info.getValue()}</div>,
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          const { project_id, role_id } = info.row.original
          console.log(info.row.original, 'check propsss')
          return CustomerTableContextMenu({
            project_id,
            customerId,
            role_id,
          })
        },
        header: () => null,
        footer: info => info.column.id,
      }),
    ],
    [],
  )

  return (
    <BaseTable
      data={data}
      columns={columns}
      onDataText={t('table:no_tenant_role')}
      {...props}
    />
  )
}
