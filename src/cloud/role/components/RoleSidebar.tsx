import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import storage from '~/utils/storage'
import { useGetRoles } from '../api'
import { ComboBoxSelectRole } from './ComboBoxSelectRole'
import { CreateRole } from './CreateRole'
import TitleBar from '~/components/Head/TitleBar'
import { RoleTable } from './RoleTable'

import { type Role } from '../types'

export function RoleSidebar() {
  const { t } = useTranslation()

  const [offset, setOffset] = useState(0)

  const projectId = storage.getProject()?.id

  const [filteredComboboxData, setFilteredComboboxData] = useState<Role[]>([])

  const { data, isPreviousData } = useGetRoles({ projectId })

  return (
    <>
      <TitleBar title={t('cloud:role_manage.sidebar.title')} />
      <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-end">
          <div className="flex items-center gap-x-3">
            <CreateRole />
            <ComboBoxSelectRole
              data={data?.roles || []}
              setFilteredComboboxData={setFilteredComboboxData}
            />
          </div>
        </div>
        <RoleTable
          data={filteredComboboxData}
          offset={offset}
          setOffset={setOffset}
          total={0}
          isPreviousData={isPreviousData}
        />
      </div>
    </>
  )
}
