import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import storage from '~/utils/storage'
import { type UserInfo, useGetUsers } from '../api/userAPI'
import { ComboBoxSelectUser, CreateUser, UserTable } from '../components/User'

export function UserManage() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const [filteredComboboxData, setFilteredComboboxData] = useState<UserInfo[]>(
    [],
  )
  const [offset, setOffset] = useState(0)

  const params = useParams()

  const orgId = params.orgId as string
  const { id: projectId } = storage.getProject()
  const {
    data: UserData,
    isPreviousData,
    isSuccess,
  } = useGetUsers({
    projectId,
    orgId,
    offset,
    config: { keepPreviousData: true },
  })

  return (
    <div ref={ref} className="uer-pnf flex grow flex-col">
      <TitleBar title={t('cloud:org_manage.user_manage.header')} />
      <div className="flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <ExportTable refComponent={ref} />
          <div className="flex items-center gap-x-3">
            <CreateUser />
            {isSuccess ? (
              <ComboBoxSelectUser
                data={UserData}
                setFilteredComboboxData={setFilteredComboboxData}
                offset={offset}
              />
            ) : null}
          </div>
        </div>
        <UserTable
          data={filteredComboboxData}
          offset={offset}
          setOffset={setOffset}
          total={UserData?.total ?? 0}
          isPreviousData={isPreviousData}
        />
      </div>
    </div>
  )
}
