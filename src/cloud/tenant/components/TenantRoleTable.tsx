import { Menu } from '@headlessui/react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { Button } from '~/components/Button'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Dropdown } from '~/components/Dropdown'
import { BtnContextMenuIcon } from '~/components/SVGIcons'
import { BaseTable } from '~/components/Table'
import { type BaseTablePagination } from '~/types'
import { useDisclosure } from '~/utils/hooks'
import { useDeleteCustomerRole } from '../api/deleteTenantRoleApi'
import { type CustomerRoleEntity } from '../types'
import { UpdateCustomerRole } from './UpdateTenantRole'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/Dropdowns'

type CustomerRoleTableProps = {
  data: CustomerRoleEntity[]
  isHiddenCheckbox: boolean
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
        <DropdownMenuContent className='z-[9999]'>
          <DropdownMenuItem>
            <div className='flex gap-x-2 hover:text-primary-300'
              onClick={openEdit}>
              <img src={btnEditIcon} alt="Edit customer role" className="h-5 w-5" />
              {t('form:role.edit')}
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ConfirmationDialog
              isDone={isSuccess}
              icon="danger"
              title={t('form:role.delete')}
              body={`${t('cloud:dashboard.table.delete_confirm')} ${name}`}
              triggerButton={
                <Button
                  className="hover:text-primary-400 w-full justify-start p-0 border-none shadow-none"
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
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
          return <div className="text-center">{orderId}</div>
        },
        header: () => <span>{t('table:no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('project_id', {
        header: () => <span>Project</span>,
        cell: info => <div className="text-center">{info.getValue()}</div>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('role_id', {
        header: () => <span>Role</span>,
        cell: info => <div className="text-center">{info.getValue()}</div>,
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
