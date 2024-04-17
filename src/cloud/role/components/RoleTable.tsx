import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo, useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/Button'

import { BaseTable } from '@/components/Table'
import { useCopyId, useDisclosure } from '@/utils/hooks'

import { type BaseTablePagination } from '@/types'

import btnCopyIdIcon from '@/assets/icons/btn-copy_id.svg'
import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import btnEditIcon from '@/assets/icons/btn-edit.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { BtnContextMenuIcon } from '@/components/SVGIcons'
import { useDeleteRole } from '../api'
import { type Role } from '../types'
import { convertActionsENtoVN } from './RoleSidebar'
import { UpdateRole } from './UpdateRole'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/Dropdowns'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { type BaseTableProps } from '@/components/Table'
import { LuEye, LuPen, LuTrash2, LuMoreVertical, LuFiles } from 'react-icons/lu'

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
  const {
    close: closeDelete,
    open: openDelete,
    isOpen: isOpenDelete,
  } = useDisclosure()

  const { mutate, isLoading, isSuccess } = useDeleteRole()
  const handleCopyId = useCopyId()

  return (
    <>
      <div className="flex">
        <div className="flex cursor-pointer justify-center p-3">
          <LuPen
            className="text-lg text-gray-500"
            onClick={() => {
              open()
              setSelectedUpdateRole(role)
            }}
          />
        </div>
        <div className="flex cursor-pointer justify-center p-3">
          <LuFiles
            className="text-lg text-gray-500"
            onClick={() => handleCopyId(id)}
          />
        </div>
        <div className="flex cursor-pointer justify-center p-3">
          <LuTrash2 className="text-lg text-gray-500" onClick={openDelete} />
        </div>
        {/* <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex cursor-pointer justify-center p-3">
              <LuMoreVertical className="text-lg text-gray-500" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => {
                open()
                setSelectedUpdateRole(role)
              }}
            >
              <img src={btnEditIcon} alt="Edit role" className="h-5 w-5" />
              {t('cloud:role_manage.sidebar.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopyId(id)}>
              <img
                src={btnCopyIdIcon}
                alt="Copy role's ID"
                className="h-5 w-5"
              />
              {t('table:copy_id')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openDelete}>
              <img src={btnDeleteIcon} alt="Delete role" className="h-5 w-5" />
              {t('cloud:role_manage.sidebar.delete_role')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>
      {selectedUpdateRole != null && isOpen ? (
        <UpdateRole
          project_id={project_id}
          close={close}
          isOpen={isOpen}
          roleId={selectedUpdateRole.id}
          name={selectedUpdateRole.name}
          policy={selectedUpdateRole.policies}
          role_type={selectedUpdateRole.role_type}
        />
      ) : null}

      {isOpenDelete ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:role_manage.sidebar.delete_role')}
          body={t('cloud:role_manage.sidebar.delete_role_confirm').replace(
            '{{ROLENAME}}',
            name,
          )}
          close={closeDelete}
          isOpen={isOpenDelete}
          handleSubmit={() => mutate({ id })}
          isLoading={isLoading}
        />
      ) : null}
    </>
  )
}

type PartialBaseTableProps<T> = Omit<BaseTableProps<Role>, 'columns'> & {
  columns?: ColumnDef<T, any>[]
}

type RoleTableProps = {
  data: Role[]
  project_id: string
} & PartialBaseTableProps<Roles>

export function RoleTable({ data, ...props }: RoleTableProps) {
  const { t } = useTranslation()

  const offsetPrev = useRef<number>(props.offset)

  useEffect(() => {
    if (props.isPreviousData && offsetPrev.current < props.offset) {
      offsetPrev.current = props.offset
    }
  }, [props.isPreviousData])

  const columnHelper = createColumnHelper<Role>()
  const columns = useMemo<ColumnDef<Role, any>[]>(
    () => [
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
