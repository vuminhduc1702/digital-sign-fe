import { useMemo, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import TitleBar from '~/components/Head/TitleBar'
import storage from '~/utils/storage'
import { useGetRoles } from '../api'
import { CreateRole } from './CreateRole'
import { RoleTable } from './RoleTable'

import { Button } from '~/components/Button'

import { ExportTable } from '~/components/Table/components/ExportTable'
import { useDeleteMultipleRoles } from '../api/deleteMultipleRoles'
import { SearchField } from '~/components/Input'
import { useDisclosure } from '~/utils/hooks'
import { ConfirmDialog } from '~/components/ConfirmDialog'

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

  const projectId = storage.getProject()?.id

  const { data, isPreviousData } = useGetRoles({ projectId, offset })
  const { close, open, isOpen } = useDisclosure()

  const ref = useRef(null)
  const {
    mutate: mutateDeleteMultipleRoles,
    isLoading,
    isSuccess: isSuccessDeleteMultipleRoles,
  } = useDeleteMultipleRoles()

  useEffect(() => {
    if (isSuccessDeleteMultipleRoles) {
      close()
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
  const aoo = data?.roles?.reduce(
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
    <>
      <TitleBar title={t('cloud:role_manage.sidebar.title')} />
      <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <ExportTable
            refComponent={ref}
            rowSelection={rowSelection}
            aoo={aoo}
            pdfHeader={pdfHeader}
          />
          <div className="mr-[42px] flex items-center gap-x-3">
            {Object.keys(rowSelection).length > 0 && (
              <div
                onClick={open}
                className="flex cursor-pointer gap-1 rounded-md bg-red-600 p-2 text-white"
              >
                <div>{t('btn:delete')}:</div>
                <div>{Object.keys(rowSelection).length}</div>
              </div>
            )}
            <CreateRole />
            <SearchField
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        </div>
        <RoleTable
          project_id={projectId}
          data={data?.roles ?? []}
          offset={offset}
          setOffset={setOffset}
          total={data?.total || 0}
          isPreviousData={isPreviousData}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
      {isOpen ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:role_manage.sidebar.delete_role')}
          body={t('cloud:role_manage.sidebar.delete_multiple_roles')}
          close={close}
          isOpen={isOpen}
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
    </>
  )
}
