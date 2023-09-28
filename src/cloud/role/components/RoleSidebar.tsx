import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { useCopyId, useDisclosure } from '~/utils/hooks'
import storage from '~/utils/storage'
import { useDeleteRole, useGetRoles } from '../api'
import { ComboBoxSelectRole } from './ComboBoxSelectRole'
import { CreateRole } from './CreateRole'

import { type Role } from '../types'

import TitleBar from '~/components/Head/TitleBar'
import { RoleTable } from './RoleTable'

export function RoleSidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { close, open, isOpen } = useDisclosure()
  const [offset, setOffset] = useState(0)

  const { id: projectId } = storage.getProject()

  const [filteredComboboxData, setFilteredComboboxData] = useState<Role[]>([])

  const { data, isPreviousData } = useGetRoles({ projectId })

  return (
    <>
      <TitleBar
        title={t('cloud:role_manage.sidebar.title')}
      />
      <div className="flex grow flex-col px-9 py-3 shadow-lg">
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
