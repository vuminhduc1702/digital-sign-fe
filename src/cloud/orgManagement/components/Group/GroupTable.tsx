import React, { useMemo, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'

import { Button } from '@/components/Button'
import { BaseTable, type BaseTableProps } from '@/components/Table'
import { useCopyId, useDisclosure } from '@/utils/hooks'
import { PATHS } from '@/routes/PATHS'
import { useDeleteGroup } from '../../api/groupAPI'
import { UpdateGroup } from './UpdateGroup'
import storage from '@/utils/storage'

import { type Group } from '../../types'
import { type BaseTablePagination } from '@/types'

import { type EntityType } from '../../api/attrAPI'

import { BtnContextMenuIcon } from '@/components/SVGIcons'
import btnEditIcon from '@/assets/icons/btn-edit.svg'
import btnDetailIcon from '@/assets/icons/btn-detail.svg'
import btnCopyIdIcon from '@/assets/icons/btn-copy_id.svg'
import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import AssignUser from './AssignUser'
import AssignGroupRole from './AssignGroupRole'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { LuEye, LuPen, LuTrash2, LuMoreVertical, LuFiles } from 'react-icons/lu'

export type GroupType = {
  id: string
  name: string
  org_name: string
  organization: string
  project_id: string
  attributes: string
}

function GroupTableContextMenu({
  id,
  name,
  org_name,
  ...props
}: {
  id: string
  name: string
  entity_type: Exclude<EntityType, 'GROUP' | 'TEMPLATE'>
  organization: string
  org_name: string
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { close, open, isOpen } = useDisclosure()

  const {
    close: closeAssignUser,
    open: openAssignUser,
    isOpen: isOpenAssignUser,
  } = useDisclosure()

  const {
    close: closeDelete,
    open: openDelete,
    isOpen: isOpenDelete,
  } = useDisclosure()

  const {
    close: closeAssignGroupRole,
    open: openAssignGroupRole,
    isOpen: isOpenAssignGroupRole,
  } = useDisclosure()

  const projectId = storage.getProject()?.id
  const { orgId } = useParams()

  const { mutateAsync, isLoading, isSuccess } = useDeleteGroup()

  const handleCopyId = useCopyId()

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
          <LuFiles
            className="text-lg text-gray-500 transition-all duration-200 ease-in-out hover:scale-125 hover:text-black"
            onClick={() => handleCopyId(id)}
          />
        </div>
        <div className="flex cursor-pointer justify-center p-3">
          <LuTrash2
            className="text-lg text-gray-500 transition-all duration-200 ease-in-out hover:scale-125 hover:text-black"
            onClick={openDelete}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex cursor-pointer justify-center p-3">
              <LuMoreVertical className="text-lg text-gray-500 transition-all duration-200 ease-in-out hover:scale-125 hover:text-black" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() =>
                navigate(
                  `${PATHS.GROUP_MANAGE}/${projectId}/${
                    orgId != null ? `${orgId}/${id}` : ` /${id}`
                  }`,
                )
              }
            >
              <img src={btnDetailIcon} alt="View group" className="h-5 w-5" />
              {t('table:view_detail')}
            </DropdownMenuItem>
            {props.entity_type === 'DEVICE' && (
              <DropdownMenuItem onClick={openAssignUser}>
                <img src={btnEditIcon} alt="Assign user" className="h-5 w-5" />
                {t('cloud:org_manage.user_manage.add_user.assign')}
              </DropdownMenuItem>
            )}
            {props.entity_type === 'USER' && (
              <DropdownMenuItem onClick={openAssignGroupRole}>
                <img src={btnEditIcon} alt="Assign user" className="h-5 w-5" />
                {t('cloud:org_manage.user_manage.add_user.assign_role')}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={open}>
              <img src={btnEditIcon} alt="Edit group" className="h-5 w-5" />
              {t('cloud:org_manage.group_manage.add_group.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopyId(id)}>
              <img
                src={btnCopyIdIcon}
                alt="Copy group's ID"
                className="h-5 w-5"
              />
              {t('table:copy_id')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openDelete}>
              <img src={btnDeleteIcon} alt="Delete group" className="h-5 w-5" />
              {t('cloud:org_manage.group_manage.table.delete_group')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isOpen ? (
        <UpdateGroup
          groupId={id}
          name={name}
          org_name={org_name}
          close={close}
          isOpen={isOpen}
          {...props}
        />
      ) : null}

      {isOpenAssignUser && (
        <AssignUser
          closeAssignUser={closeAssignUser}
          isOpenAssignUser={isOpenAssignUser}
          groupId={id}
        />
      )}

      {isOpenAssignGroupRole && (
        <AssignGroupRole
          closeAssignGroupRole={closeAssignGroupRole}
          isOpenAssignGroupRole={isOpenAssignGroupRole}
          groupId={id}
        />
      )}

      {isOpenDelete ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:org_manage.group_manage.table.delete_group')}
          body={t(
            'cloud:org_manage.group_manage.table.delete_group_confirm',
          ).replace('{{GROUPNAME}}', name)}
          close={closeDelete}
          isOpen={isOpenDelete}
          handleSubmit={() => mutateAsync({ id })}
          isLoading={isLoading}
        />
      ) : null}
    </>
  )
}

type PartialBaseTableProps<T> = Omit<BaseTableProps<Group>, 'columns'> & {
  columns?: ColumnDef<T, any>[]
}

type GroupTableProps = {
  data: Group[]
  rowSelection: { [key: string]: boolean }
  setRowSelection: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >
} & PartialBaseTableProps<Group>

export function GroupTable({ data, ...props }: GroupTableProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const projectId = storage.getProject()?.id

  const { orgId } = useParams()

  const offsetPrev = useRef<number>(props.offset)

  useEffect(() => {
    if (props.isPreviousData && offsetPrev.current < props.offset) {
      offsetPrev.current = props.offset
    }
  }, [props.isPreviousData])

  function navigateToDetail(id: string) {
    navigate(
      `${PATHS.GROUP_MANAGE}/${projectId}/${
        orgId != null ? `${orgId}/${id}` : ` /${id}`
      }`,
    )
  }

  const columnHelper = createColumnHelper<Group>()
  const columns = useMemo<ColumnDef<Group, any>[]>(
    () => [
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          const { name, id, organization, entity_type } = info.row.original
          return GroupTableContextMenu({ name, id, organization, entity_type })
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
        header: () => (
          <span>{t('cloud:org_manage.group_manage.table.name')}</span>
        ),
        cell: info => info.row.original.name,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('entity_type', {
        header: () => (
          <span>{t('cloud:org_manage.group_manage.table.entity_type')}</span>
        ),
        cell: info => {
          return (
            t(`cloud:org_manage.group_manage.table.${info.getValue()}`) ||
            info.getValue()
          )
        },
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'orgName',
        header: () => (
          <span>{t('cloud:org_manage.group_manage.table.org_name')}</span>
        ),
        cell: info => info.row.original.org_name || t('table:no_in_org'),
        footer: info => info.column.id,
      }),
    ],
    [props.offset],
  )

  return (
    <BaseTable
      popoverClassName="absolute right-0 top-1 block"
      data={data}
      columns={columns}
      viewDetailOnClick={navigateToDetail}
      {...props}
    />
  )
}
