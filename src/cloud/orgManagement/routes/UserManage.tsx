import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { Button } from '~/components/Button'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import storage from '~/utils/storage'
import { uppercaseTheFirstLetter } from '~/utils/transformFunc'
import { useGetUsers } from '../api/userAPI'
import { useDeleteMultipleUsers } from '../api/userAPI/deleteMultipleUsers'
import { CreateUser, UserTable } from '../components/User'
import { flattenData } from '~/utils/misc'
import { InputField } from '~/components/Form'
import { SearchIcon } from '~/components/SVGIcons'
import { XMarkIcon } from '@heroicons/react/20/solid'

export function UserManage() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [offset, setOffset] = useState(0)

  const params = useParams()

  const orgId = params.orgId as string
  const projectId = storage.getProject()?.id
  const {
    data: userData,
    isPreviousData,
    isSuccess,
  } = useGetUsers({
    projectId,
    orgId,
    offset,
    config: { keepPreviousData: true },
  })

  const { acc: userFlattenData } = flattenData(userData?.users, [
    'user_id',
    'name',
    'email',
    'role_name',
    'activate',
    'org_id',
    'org_name',
    'role_name',
    'role_id',
    'phone',
    'profile',
  ])

  const {
    mutate: mutateDeleteMultipleUsers,
    isLoading,
    isSuccess: isSuccessDeleteMultipleUsers,
  } = useDeleteMultipleUsers()
  const [rowSelection, setRowSelection] = useState({})
  const pdfHeader = useMemo(
    () => [
      t('table:no'),
      t('cloud:org_manage.org_manage.overview.name'),
      'Email',
      t('cloud:org_manage.user_manage.table.role_name'),
      t('cloud:org_manage.user_manage.table.activate'),
    ],
    [],
  )
  const rowSelectionKey = Object.keys(rowSelection)
  const aoo: Array<{ [key: string]: string }> | undefined =
    userFlattenData.reduce((acc, curr, index) => {
      if (rowSelectionKey.includes(curr.user_id)) {
        const temp = {
          [t('table:no')]: (index + 1).toString(),
          [t('cloud:org_manage.org_manage.overview.name')]: curr.name,
          Email: curr.email,
          [t('cloud:org_manage.user_manage.table.role_name')]: curr.role_name
            ? uppercaseTheFirstLetter(curr.role_name)
            : '',
          [t('cloud:org_manage.user_manage.table.activate')]: curr.activate
            ? 'Có'
            : 'Không',
        }
        acc.push(temp)
      }
      return acc
    }, [] as Array<{ [key: string]: string }>)

  return (
    <div ref={ref} className="uer-pnf flex grow flex-col">
      <TitleBar title={t('cloud:org_manage.user_manage.header')} />
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
                isDone={isSuccessDeleteMultipleUsers}
                icon="danger"
                title={t('cloud:org_manage.user_manage.table.delete_user_full')}
                body={t(
                  'cloud:org_manage.user_manage.table.delete_multiple_user_confirm',
                )}
                triggerButton={
                  <div className="flex cursor-pointer gap-1 rounded-md bg-red-600 p-2 text-white">
                    <div>{t('btn:delete')}:</div>
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
                      mutateDeleteMultipleUsers(
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
                        className="size-5"
                      />
                    }
                  />
                }
              />
            )}
            <CreateUser />
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
        <UserTable
          data={userData?.users ?? []}
          offset={offset}
          setOffset={setOffset}
          total={userData?.total ?? 0}
          isPreviousData={isPreviousData}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
    </div>
  )
}
