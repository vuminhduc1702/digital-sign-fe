import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import storage from '~/utils/storage'
import { useGetRoles } from '../api'
import { CreateRole } from './CreateRole'
import TitleBar from '~/components/Head/TitleBar'
import { RoleTable } from './RoleTable'
import { flattenData } from '~/utils/misc'

import { type Role } from '../types'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Button } from '~/components/Button'
import { useDeleteMultipleRoles } from '../api/deleteMultipleRoles'
import { InputField } from '~/components/Form'
import { SearchIcon } from '~/components/SVGIcons'
import { XMarkIcon } from '@heroicons/react/20/solid'

const convertENtoVN = (enArr: string[]) => {
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
  const [searchQuery, setSearchQuery] = useState('')

  const projectId = storage.getProject()?.id

  const { data, isPreviousData } = useGetRoles({ projectId, offset })

  const { acc: roleFlattenData, extractedPropertyKeys } = flattenData(
    data?.roles,
    ['id', 'name', 'policies', 'role_type'],
  )

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
  const aoo: Array<{ [key: string]: string }> | undefined =
    roleFlattenData.reduce((acc, curr, index) => {
      if (rowSelectionKey.includes(curr.id)) {
        const temp = {
          [t('table:no')]: (index + 1).toString(),
          [t('cloud:role_manage.add_role.name')]: curr.name,
          [t('cloud:role_manage.add_role.role_type')]: curr.role_type
            ? curr.role_type
            : 'Generic',
          [t('cloud:role_manage.add_role.actions')]: convertENtoVN(
            JSON.parse(curr.policies)[0].actions,
          ).toString(),
        }
        acc.push(temp)
      }
      return acc
    }, [] as Array<{ [key: string]: string }>)

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
            <InputField
              type="text"
              placeholder={t('table:search')}
              value={searchQuery}
              onChange={e => {
                const value = e.target.value
                setSearchQuery(value)
              }}
              endIcon={
                <div className="absolute top-1/2 right-2 -translate-y-1/2 transform flex justify-center">
                  {searchQuery.length > 0 && (
                    <XMarkIcon
                      className="h-[16px] w-[16px] mr-[5px] transform cursor-pointer opacity-50 flex align-center justify-center cursor-pointer"
                      onClick={() => setSearchQuery('')}
                    />
                  )}
                  <SearchIcon
                    className="cursor-pointer flex justify-between align-center"
                    width={16}
                    height={16}
                    viewBox="0 0 16 16"
                  />
                </div>
              }
            />
          </div>
        </div>
        <RoleTable
          project_id={projectId}
          data={roleFlattenData}
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
