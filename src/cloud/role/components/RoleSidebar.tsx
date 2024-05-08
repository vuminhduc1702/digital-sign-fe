import { useMemo, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import TitleBar from '@/components/Head/TitleBar'
import storage from '@/utils/storage'
import { useGetRoles } from '../api'
import { CreateRole } from './CreateRole'
import { RoleTable } from './RoleTable'

import { Button } from '@/components/ui/button'

import { ExportTable } from '@/components/Table/components/ExportTable'
import { useDeleteMultipleRoles } from '../api/deleteMultipleRoles'
import { SearchField } from '@/components/Input'
import { useDisclosure } from '@/utils/hooks'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export const convertActionsENtoVN = (enArr: string[]) => {
  return enArr?.map(item => {
    if (item === 'read') {
      return 'Xem'
    } else if (item === 'modify') {
      return 'Chỉnh sửa'
    } else if (item === 'create') {
      return 'Tạo mới'
    } else {
      return 'Xoá'
    }
  })
}

export function RoleSidebar() {
  const { t } = useTranslation()

  const [offset, setOffset] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchData, setIsSearchData] = useState<boolean>(false)

  const projectId = storage.getProject()?.id

  const {
    data,
    isLoading: isLoadingRoles,
    isPreviousData,
  } = useGetRoles({ projectId, offset })
  const {
    open: openCreateRole,
    close: closeCreateRole,
    isOpen: isOpenCreateRole,
  } = useDisclosure()
  const {
    close: closeDeleteMulti,
    open: openDeleteMulti,
    isOpen: isOpenDeleteMulti,
  } = useDisclosure()

  const ref = useRef(null)
  const {
    mutate: mutateDeleteMultipleRoles,
    isLoading,
    isSuccess: isSuccessDeleteMultipleRoles,
  } = useDeleteMultipleRoles()

  useEffect(() => {
    if (isSuccessDeleteMultipleRoles) {
      closeDeleteMulti()
    }
  }, [isSuccessDeleteMultipleRoles])

  const [rowSelection, setRowSelection] = useState({})
  const pdfHeader = useMemo(
    () => [
      t('table:no'),
      t('cloud:role_manage.add_role.name'),
      t('cloud:role_manage.add_role.role_type'),
      t('cloud:role_manage.add_role.actions'),
    ],
    [],
  )
  const rowSelectionKey = Object.keys(rowSelection)
  const formatExcel: Array<{ [key: string]: unknown }> | undefined =
    data?.roles?.reduce(
      (acc, curr, index) => {
        if (rowSelectionKey.includes(curr.id)) {
          const temp = {
            [t('table:no')]: (index + 1).toString(),
            [t('cloud:role_manage.add_role.name')]: curr.name,
            [t('cloud:role_manage.add_role.role_type')]: curr.role_type
              ? curr.role_type
              : 'Generic',
            [t('cloud:role_manage.add_role.actions')]: convertActionsENtoVN(
              curr.policies[0].actions,
            ).toString(),
          }
          acc.push(temp)
        }
        return acc
      },
      [] as Array<{ [key: string]: unknown }>,
    )

  return (
    <div className="flex grow flex-col">
      <TitleBar title={t('cloud:role_manage.sidebar.title')} />
      <div className="relative flex h-full grow flex-col gap-5 px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <div className="flex w-full items-center justify-between gap-x-3">
            <SearchField
              setSearchValue={setSearchQuery}
              setIsSearchData={setIsSearchData}
              closeSearch={true}
            />
            <Button
              className="h-[38px] rounded border-none"
              onClick={openCreateRole}
            >
              {t('cloud:role_manage.add_role.button')}
            </Button>
          </div>
        </div>
        <RoleTable
          project_id={projectId}
          data={data?.roles ?? []}
          offset={offset}
          setOffset={setOffset}
          total={data?.total || 0}
          isPreviousData={isPreviousData}
          isLoading={isLoadingRoles}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          pdfHeader={pdfHeader}
          formatExcel={formatExcel}
          isSearchData={searchQuery.length > 0 && isSearchData}
          utilityButton={
            Object.keys(rowSelection).length > 0 && (
              <div className="flex items-center">
                <Button
                  size="sm"
                  onClick={openDeleteMulti}
                  className="h-full min-w-[60px] rounded-none border-none hover:opacity-80"
                >
                  <div>{t('btn:delete')}:</div>
                  <div>{Object.keys(rowSelection).length}</div>
                </Button>
              </div>
            )
          }
        />
      </div>
      {isOpenCreateRole && (
        <CreateRole
          project_id={projectId}
          open={openCreateRole}
          close={closeCreateRole}
          isOpen={isOpenCreateRole}
        />
      )}
      {isOpenDeleteMulti ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:role_manage.sidebar.delete_role')}
          body={t('cloud:role_manage.sidebar.delete_multiple_roles')}
          close={closeDeleteMulti}
          isOpen={isOpenDeleteMulti}
          isSuccessDelete={isSuccessDeleteMultipleRoles}
          handleSubmit={() =>
            mutateDeleteMultipleRoles(
              {
                data: { ids: rowSelectionKey },
              },
              { onSuccess: () => setRowSelection({}) },
            )
          }
          isLoading={isLoading}
        />
      ) : null}
    </div>
  )
}
