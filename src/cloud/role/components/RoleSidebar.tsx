import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import TitleBar from '~/components/Head/TitleBar'
import storage from '~/utils/storage'
import { useGetRoles } from '../api'
import { CreateRole } from './CreateRole'
import { RoleTable } from './RoleTable'

import { Button } from '~/components/Button'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { useDeleteMultipleRoles } from '../api/deleteMultipleRoles'

export const convertActionsENtoVN = (enArr: string[]) => {
  return enArr.map(item => {
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

  const projectId = storage.getProject()?.id

  const { data, isPreviousData } = useGetRoles({ projectId, offset })

  const ref = useRef(null)
  const {
    mutate: mutateDeleteMultipleRoles,
    isLoading,
    isSuccess: isSuccessDeleteMultipleRoles,
  } = useDeleteMultipleRoles()
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
  const aoo: Array<{ [key: string]: string }> | undefined = data?.roles.reduce(
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
    [] as Array<{ [key: string]: string }>,
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
          <div className="flex items-center gap-x-3">
            {Object.keys(rowSelection).length > 0 && (
              <ConfirmationDialog
                isDone={isSuccessDeleteMultipleRoles}
                icon="danger"
                title={t('cloud:role_manage.sidebar.delete_role')}
                body={t('cloud:role_manage.sidebar.delete_multiple_roles')}
                triggerButton={
                  <div className="flex cursor-pointer gap-1 rounded-md bg-red-600 p-2 text-white">
                    <div>Xoá:</div>
                    <div>{Object.keys(rowSelection).length}</div>
                  </div>
                }
                confirmButton={
                  <Button
                    isLoading={isLoading}
                    type="button"
                    size="md"
                    className="bg-primary-400"
                    onClick={() =>
                      mutateDeleteMultipleRoles(
                        {
                          data: { ids: rowSelectionKey },
                        },
                        { onSuccess: () => setRowSelection({}) },
                      )
                    }
                    startIcon={
                      <img
                        src={btnSubmitIcon}
                        alt="Submit"
                        className="h-5 w-5"
                      />
                    }
                  />
                }
              />
            )}
            <CreateRole />
            {/* dummyInput */}
          </div>
        </div>
        <RoleTable
          project_id={projectId}
          data={data?.roles || []}
          offset={offset}
          setOffset={setOffset}
          total={data?.total || 0}
          isPreviousData={isPreviousData}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
    </>
  )
}
