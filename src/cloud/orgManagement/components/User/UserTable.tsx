import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu } from '@headlessui/react'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'

import { Dropdown, MenuItem } from '~/components/Dropdown'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Button } from '~/components/Button'
import { BaseTable } from '~/components/Table'
import { useCopyId, useDisclosure } from '~/utils/hooks'
import { UpdateUser } from './UpdateUser'
import { STATUS } from '../Attributes'
import { type UserInfo, useDeleteUser, Profile } from '../../api/userAPI'

import { type BaseTablePagination } from '~/types'

import { BtnContextMenuIcon } from '~/components/SVGIcons'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnCopyIdIcon from '~/assets/icons/btn-copy_id.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

function UserTableContextMenu({
  user_id,
  name,
  email,
  org_id,
  org_name,
  role_id,
  role_name,
  phone,
  profile,
}: {
  user_id: string
  name: string
  email: string
  org_id: string
  org_name: string
  role_id: string
  role_name: string
  phone: string
  profile: string
}) {
  const { t } = useTranslation()

  const { close, open, isOpen } = useDisclosure()

  const { mutate, isLoading, isSuccess } = useDeleteUser()

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
                <img src={btnEditIcon} alt="Edit user" className="h-5 w-5" />
              }
              onClick={open}
            >
              {t('cloud:org_manage.user_manage.table.edit')}
            </MenuItem>
            <MenuItem
              icon={
                <img
                  src={btnCopyIdIcon}
                  alt="Copy user's ID"
                  className="h-5 w-5"
                />
              }
              onClick={() => handleCopyId(user_id)}
            >
              {t('table:copy_id')}
            </MenuItem>
            <ConfirmationDialog
              isDone={isSuccess}
              icon="danger"
              title={t('cloud:org_manage.user_manage.table.delete_user_full')}
              body={t(
                'cloud:org_manage.user_manage.table.delete_user_confirm',
              ).replace('{{USERNAME}}', name)}
              triggerButton={
                <Button
                  className="hover:text-primary-400 w-full justify-start border-none"
                  variant="trans"
                  size="square"
                  startIcon={
                    <img
                      src={btnDeleteIcon}
                      alt="Delete user"
                      className="h-5 w-5"
                    />
                  }
                >
                  {t('cloud:org_manage.user_manage.table.delete_user')}
                </Button>
              }
              confirmButton={
                <Button
                  isLoading={isLoading}
                  type="button"
                  size="md"
                  className="bg-primary-400"
                  onClick={() => mutate({ user_id })}
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
        <UpdateUser
          userId={user_id}
          phone={phone}
          name={name}
          email={email}
          org_id={org_id}
          role_id={role_id}
          org_name={org_name}
          role_name={role_name}
          close={close}
          isOpen={isOpen}
          profile={profile}
        />
      ) : null}
    </>
  )
}

type UserInfoTableProps = {
  data: UserInfo[]
} & BaseTablePagination

export function UserTable({ data, ...props }: UserInfoTableProps) {
  const { t } = useTranslation()

  const columnHelper = createColumnHelper<UserInfo>()
  const columns = useMemo<ColumnDef<UserInfo, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => info.row.index + 1,
        header: () => <span>{t('table:no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('name', {
        header: () => (
          <span>{t('cloud:org_manage.user_manage.table.name')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('email', {
        header: () => (
          <span>{t('cloud:org_manage.user_manage.table.email')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('role_name', {
        header: () => (
          <span>{t('cloud:org_manage.user_manage.table.role_name')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('activate', {
        header: () => (
          <span>{t('cloud:org_manage.user_manage.table.activate')}</span>
        ),
        cell: info => STATUS[info.getValue()],
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          const {
            name,
            email,
            user_id,
            org_id,
            org_name,
            role_id,
            role_name,
            phone,
            profile,
          } = info.row.original
          return UserTableContextMenu({
            name,
            email,
            user_id,
            org_id,
            org_name,
            role_id,
            role_name,
            phone,
            profile,
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
      popoverClassName="absolute right-0 top-1 block"
      data={data}
      columns={columns}
      onDataText={t('table:no_user')}
      {...props}
    />
  )
}
