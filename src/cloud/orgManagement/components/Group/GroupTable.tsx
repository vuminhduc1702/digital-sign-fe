import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu } from '@headlessui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Button } from '~/components/Button'
import { BaseTable } from '~/components/Table'
import { useCopyId, useDisclosure } from '~/utils/hooks'
import { PATHS } from '~/routes/PATHS'
import { useDeleteGroup } from '../../api/groupAPI'
import { UpdateGroup } from './UpdateGroup'
import storage from '~/utils/storage'

import { type Group } from '../../types'
import { type BaseTablePagination } from '~/types'

import { type EntityType } from '../../api/attrAPI'

import { BtnContextMenuIcon } from '~/components/SVGIcons'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnDetailIcon from '~/assets/icons/btn-detail.svg'
import btnCopyIdIcon from '~/assets/icons/btn-copy_id.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import AssignUser from './AssignUser'
import AssignGroupRole from './AssignGroupRole'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/Dropdowns'

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
  ...props
}: {
  id: string
  name: string
  entity_type: Exclude<EntityType, 'GROUP' | 'TEMPLATE'>
  organization: string
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
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() =>
              navigate(
                `${PATHS.GROUP_MANAGE}/${projectId}/${orgId != null ? `${orgId}/${id}` : ` /${id}`
                }`,
              )
            }
          >
            <img src={btnDetailIcon} alt="View group" className="size-5" />
            {t('table:view_detail')}
          </DropdownMenuItem>
          {props.entity_type === 'DEVICE' && (
            <DropdownMenuItem
              onClick={openAssignUser}
            >
              <img src={btnEditIcon} alt="Assign user" className="size-5" />
              {t('cloud:org_manage.user_manage.add_user.assign')}
            </DropdownMenuItem>
          )}
          {props.entity_type === 'USER' && (
            <DropdownMenuItem
              onClick={openAssignGroupRole}
            >
              <img src={btnEditIcon} alt="Assign user" className="size-5" />
              {t('cloud:org_manage.user_manage.add_user.assign_role')}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={open}
          >
            <img src={btnEditIcon} alt="Edit group" className="size-5" />
            {t('cloud:org_manage.group_manage.add_group.edit')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleCopyId(id)}
          >
            <img
              src={btnCopyIdIcon}
              alt="Copy group's ID"
              className="size-5"
            />
            {t('table:copy_id')}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ConfirmationDialog
              isDone={isSuccess}
              icon="danger"
              title={t('cloud:org_manage.group_manage.table.delete_group')}
              body={t(
                'cloud:org_manage.group_manage.table.delete_group_confirm',
              ).replace('{{GROUPNAME}}', name)}
              triggerButton={
                <Button
                  className="w-full justify-start p-0 shadow-none border-none hover:text-primary-400"
                  variant="trans"
                  size="square"
                  startIcon={
                    <img
                      src={btnDeleteIcon}
                      alt="Delete group"
                      className="size-5"
                    />
                  }
                >
                  {t('cloud:org_manage.group_manage.table.delete_group')}
                </Button>
              }
              confirmButton={
                <Button
                  isLoading={isLoading}
                  type="button"
                  size="md"
                  className="bg-primary-400"
                  onClick={async () => await mutateAsync({ id })}
                  startIcon={
                    <img src={btnSubmitIcon} alt="Submit" className="size-5" />
                  }
                />
              }
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {isOpen ? (
        <UpdateGroup
          groupId={id}
          name={name}
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
    </>
  )
}

type GroupTableProps = {
  data: Group[]
  rowSelection: { [key: string]: boolean }
  setRowSelection: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >
} & BaseTablePagination

export function GroupTable({ data, ...props }: GroupTableProps) {
  const { t } = useTranslation()
  const columnHelper = createColumnHelper<Group>()
  const columns = useMemo<ColumnDef<Group, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => info.row.index + 1 + props.offset,
        header: () => <span>{t('table:no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('name', {
        header: () => (
          <span>{t('cloud:org_manage.group_manage.table.name')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('entity_type', {
        header: () => (
          <span>{t('cloud:org_manage.group_manage.table.entity_type')}</span>
        ),
        cell: info =>
          `${info.getValue().charAt(0).toUpperCase()}${info
            .getValue()
            .toLowerCase()
            .slice(1)}`,
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
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          const { name, id, organization, entity_type } = info.row.original
          return GroupTableContextMenu({ name, id, organization, entity_type })
        },
        header: () => null,
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
      onDataText={t('table:no_group')}
      {...props}
    />
  )
}
