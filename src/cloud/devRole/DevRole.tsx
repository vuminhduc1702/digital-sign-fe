import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import storage from '~/utils/storage'
import TitleBar from '~/components/Head/TitleBar'
import { useGetRoles } from '../role/api'
import { ComboBoxSelectRole, CreateRole } from '../role/components'
import { RoleTable } from '../role/components/RoleTable'
import { type Role } from '../role'

const DevRole = () => {
  const { t } = useTranslation()

  const [offset, setOffset] = useState(0)

  const { id: projectId } = storage.getProject()

  const [filteredComboboxData, setFilteredComboboxData] = useState<Role[]>([])

  const { data, isPreviousData } = useGetRoles({ projectId })

  return (
    <>
      <TitleBar title="Danh sách dev role" />
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

export default DevRole
