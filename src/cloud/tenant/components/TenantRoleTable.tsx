import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnEditIcon from '~/assets/icons/btn-edit.svg'

import { BtnContextMenuIcon } from '~/components/SVGIcons'
import { BaseTable } from '~/components/Table'
import { type BaseTablePagination } from '~/types'
import { useDisclosure } from '~/utils/hooks'
import { useDeleteCustomerRole } from '../api/deleteTenantRoleApi'
import { type CustomerRoleEntity } from '../types'
import { UpdateCustomerRole } from './UpdateTenantRole'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/Dropdowns'
import { type PermissionEntity, type PermissionEntityTable } from '../types'
import { ConfirmDialog } from '~/components/ConfirmDialog'

type CustomerRoleTableProps = {
  data: CustomerRoleEntity[]
  customerId: string
  isHiddenCheckbox: boolean
} & BaseTablePagination

function CustomerTableContextMenu({
  project_id,
  role_id: roleIdProps,
  customerId: sub_tenant_id,
}: {
  customerId: string
} & PermissionEntity) {
  const { t } = useTranslation()

  const {
    close: closeEdit,
    open: openEdit,
    isOpen: isOpenEdit,
  } = useDisclosure()

  const {
    close: closeDelete,
    open: openDelete,
    isOpen: isOpenDelete,
  } = useDisclosure()

  const { mutate, isLoading, isSuccess } = useDeleteCustomerRole()

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
        <DropdownMenuContent className="z-[9999]">
          <DropdownMenuItem onClick={openEdit}>
            <img
              src={btnEditIcon}
              alt="Edit customer role"
              className="h-5 w-5"
            />
            {t('form:role.edit')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openDelete}>
            <img
              src={btnDeleteIcon}
              alt="Delete customer role"
              className="h-5 w-5"
            />
            {t('form:tenant.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {isOpenEdit ? (
        <UpdateCustomerRole
          project_id={project_id}
          roleIdProps={roleIdProps}
          modalTitle={t('table:edit_role')}
          isOpenRole={isOpenEdit}
          customerId={sub_tenant_id}
          closeRole={closeEdit}
        />
      ) : null}

      {isOpenDelete ? (
        <ConfirmDialog
          icon="danger"
          title={t('form:tenant.delete')}
          body={`${t('cloud:dashboard.table.delete_confirm')}`}
          close={closeDelete}
          isOpen={isOpenDelete}
          handleSubmit={() => mutate({ project_id, sub_tenant_id })}
          isLoading={isLoading}
        />
      ) : null}
    </>
  )
}

export function TenantRoleTable({ data, ...props }: CustomerRoleTableProps) {
  const { t } = useTranslation()
  const customerId = props.customerId

  const columnHelper = createColumnHelper<PermissionEntityTable>()
  const columns = useMemo<ColumnDef<PermissionEntityTable, any>[]>(
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
        header: () => <span>{t('table:project')}</span>,
        cell: info => <div className="text-center">{info.getValue()}</div>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('role_id', {
        header: () => <span>{t('table:role')}</span>,
        cell: info => <div className="text-center">{info.getValue()}</div>,
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          const { project_id, role_id } = info.row.original
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
      data={data ?? []}
      columns={columns}
      onDataText={t('table:no_tenant_role')}
      {...props}
    />
  )
}
