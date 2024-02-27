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
import { SearchField } from '~/components/Input'

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
    userData?.users?.reduce((acc, curr, index) => {
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
            <SearchField
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
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
