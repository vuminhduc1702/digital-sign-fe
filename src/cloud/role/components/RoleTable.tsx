import { Menu } from '@headlessui/react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/Button'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Dropdown, MenuItem } from '~/components/Dropdown'
import { BaseTable } from '~/components/Table'
import { useCopyId, useDisclosure } from '~/utils/hooks'

import { type BaseTablePagination } from '~/types'

import btnCopyIdIcon from '~/assets/icons/btn-copy_id.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { BtnContextMenuIcon } from '~/components/SVGIcons'
import { useDeleteRole } from '../api'
import { type Role } from '../types'
import { convertActionsENtoVN } from './RoleSidebar'
import { UpdateRole } from './UpdateRole'

function RoleTableContextMenu({
  id,
  name,
  role,
  project_id,
}: {
  id: string
  name: string
  role: Role
  project_id: string
}) {
  const { t } = useTranslation()
  const [selectedUpdateRole, setSelectedUpdateRole] = useState<Role>()

  const { close, open, isOpen } = useDisclosure()

  const { mutate, isLoading, isSuccess } = useDeleteRole()
  const handleCopyId = useCopyId()

  return (
    <>
      <Dropdown
        menuClass="h-10 w-6 ml-auto"
        icon={
          <BtnContextMenuIcon
            height={20}
            width={10}
            viewBox="0 0 1 20"
            className="text-secondary-700 hover:text-primary-400"
          />
        }
      >
        <Menu.Items className="absolute right-0 z-10 mt-11 w-40 origin-top-right divide-y divide-secondary-400 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-1">
            <MenuItem
              icon={
                <img src={btnEditIcon} alt="Edit role" className="size-5" />
              }
              onClick={() => {
                open()
                setSelectedUpdateRole(role)
              }}
            >
              {t('cloud:role_manage.sidebar.edit')}
            </MenuItem>
            <MenuItem
              icon={
                <img
                  src={btnCopyIdIcon}
                  alt="Copy role's ID"
                  className="size-5"
                />
              }
              onClick={() => handleCopyId(id)}
            >
              {t('table:copy_id')}
            </MenuItem>
            <ConfirmationDialog
              isDone={isSuccess}
              icon="danger"
              title={t('cloud:role_manage.sidebar.delete_role')}
              body={t('cloud:role_manage.sidebar.delete_role_confirm').replace(
                '{{ROLENAME}}',
                name,
              )}
              triggerButton={
                <Button
                  className="w-full justify-start border-none hover:text-primary-400"
                  variant="trans"
                  size="square"
                  startIcon={
                    <img
                      src={btnDeleteIcon}
                      alt="Delete role"
                      className="size-5"
                    />
                  }
                >
                  {t('cloud:role_manage.sidebar.delete_role')}
                </Button>
              }
              confirmButton={
                <Button
                  isLoading={isLoading}
                  type="button"
                  size="md"
                  className="bg-primary-400"
                  onClick={() => mutate({ id: id })}
                  startIcon={
                    <img src={btnSubmitIcon} alt="Submit" className="size-5" />
                  }
                />
              }
            />
          </div>
        </Menu.Items>
      </Dropdown>
      {selectedUpdateRole != null && isOpen ? (
        <UpdateRole
          project_id={project_id}
          close={close}
          isOpen={isOpen}
          roleId={selectedUpdateRole.id}
          name={selectedUpdateRole.name}
          policy={selectedUpdateRole.policies as unknown as string}
          role_type={selectedUpdateRole.role_type}
        />
      ) : null}
    </>
  )
}

type RoleTableProps = {
  data: Role[]
  project_id: string
  rowSelection: { [key: string]: boolean }
  setRowSelection: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >
} & BaseTablePagination

export function RoleTable({ data, ...props }: RoleTableProps) {
  const { t } = useTranslation()

  const columnHelper = createColumnHelper<Role>()
  const columns = useMemo<ColumnDef<Role, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => info.row.index + 1 + props.offset,
        header: () => <span>{t('table:no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('name', {
        header: () => <span>{t('cloud:role_manage.add_role.name')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('role_type', {
        header: () => <span>{t('cloud:role_manage.add_role.role_type')}</span>,
        cell: info => {
          const { role_type } = info.row.original
          return <>{role_type ? role_type : 'Generic'}</>
        },
        footer: info => info.column.id,
      }),
      columnHelper.accessor('policies', {
        header: () => <span>{t('cloud:role_manage.add_role.actions')}</span>,
        cell: info => {
          const actions = convertActionsENtoVN(
            info.row.original.policies[0].actions,
          )?.toString()
          return actions
        },
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          const role = info.row.original
          const { name, id } = info.row.original
          return RoleTableContextMenu({
            id,
            name,
            role,
            project_id: props.project_id,
          })
        },
        header: () => null,
        footer: info => info.column.id,
      }),
    ],
    [data, props.offset],
  )

  return (
    <BaseTable
      popoverClassName="absolute right-0 top-1 block"
      data={data}
      columns={columns}
      onDataText={t('table:no_role')}
      {...props}
    />
  )
}
