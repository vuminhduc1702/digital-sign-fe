import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu } from '@headlessui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'

import { Dropdown, MenuItem } from '~/components/Dropdown'
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
        <Menu.Items className="divide-secondary-400 absolute right-0 z-10 mt-6 w-40 origin-top-right divide-y rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-1">
            <MenuItem
              icon={
                <img src={btnDetailIcon} alt="View group" className="h-5 w-5" />
              }
              onClick={() =>
                navigate(
                  `${PATHS.GROUP_MANAGE}/${projectId}/${
                    orgId != null ? `${orgId}/${id}` : ` /${id}`
                  }`,
                )
              }
            >
              {t('table:view_detail')}
            </MenuItem>
            {props.entity_type === 'DEVICE' && (
              <MenuItem
                icon={
                  <img
                    src={btnEditIcon}
                    alt="Assign user"
                    className="h-5 w-5"
                  />
                }
                onClick={openAssignUser}
              >
                {t('cloud:org_manage.user_manage.add_user.assign')}
              </MenuItem>
            )}
            {props.entity_type === 'USER' && (
              <MenuItem
                icon={
                  <img
                    src={btnEditIcon}
                    alt="Assign user"
                    className="h-5 w-5"
                  />
                }
                onClick={openAssignGroupRole}
              >
                {t('cloud:org_manage.user_manage.add_user.assign_role')}
              </MenuItem>
            )}
            <MenuItem
              icon={
                <img src={btnEditIcon} alt="Edit group" className="h-5 w-5" />
              }
              onClick={open}
            >
              {t('cloud:org_manage.group_manage.add_group.edit')}
            </MenuItem>
            <MenuItem
              icon={
                <img
                  src={btnCopyIdIcon}
                  alt="Copy group's ID"
                  className="h-5 w-5"
                />
              }
              onClick={() => handleCopyId(id)}
            >
              {t('table:copy_id')}
            </MenuItem>
            <ConfirmationDialog
              isDone={isSuccess}
              icon="danger"
              title={t('cloud:org_manage.group_manage.table.delete_group')}
              body={t(
                'cloud:org_manage.group_manage.table.delete_group_confirm',
              ).replace('{{GROUPNAME}}', name)}
              triggerButton={
                <Button
                  className="hover:text-primary-400 w-full justify-start border-none"
                  variant="trans"
                  size="square"
                  startIcon={
                    <img
                      src={btnDeleteIcon}
                      alt="Delete group"
                      className="h-5 w-5"
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
                    <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
                  }
                />
              }
            />
          </div>
        </Menu.Items>
      </Dropdown>
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
  rowSelection: object
  setRowSelection: React.Dispatch<React.SetStateAction<object>>
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
    [],
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
