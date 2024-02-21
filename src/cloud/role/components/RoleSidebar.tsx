import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import storage from '~/utils/storage'
import { useGetRoles } from '../api'
import { CreateRole } from './CreateRole'
import TitleBar from '~/components/Head/TitleBar'
import { RoleTable } from './RoleTable'
import { flattenData } from '~/utils/misc'

import { type Role } from '../types'

export function RoleSidebar() {
  const { t } = useTranslation()

  const [offset, setOffset] = useState(0)

  const projectId = storage.getProject()?.id

  const { data, isPreviousData } = useGetRoles({ projectId, offset })

  const { acc: roleFlattenData, extractedPropertyKeys } = flattenData(
    data?.roles,
    ['id', 'name', 'policies', 'role_type'],
  )

  return (
    <>
      <TitleBar title={t('cloud:role_manage.sidebar.title')} />
      <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-end">
          <div className="flex items-center gap-x-3">
            <CreateRole />
            {/* dummyInput */}
          </div>
        </div>
        <RoleTable
          project_id={projectId}
          data={roleFlattenData}
          offset={offset}
          setOffset={setOffset}
          total={data?.total || 0}
          isPreviousData={isPreviousData}
        />
      </div>
    </>
  )
}
