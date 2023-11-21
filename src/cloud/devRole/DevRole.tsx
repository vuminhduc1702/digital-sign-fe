import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useNavigate } from 'react-router-dom'
import narrowLeft from '~/assets/icons/narrow-left.svg'
import { SelectField } from '~/components/Form'
import TitleBar from '~/components/Head/TitleBar'
import storage from '~/utils/storage'
import { RoleTable } from '../role/components/RoleTable'
import { ComboBoxSelectRole, CreateRole } from '../role/components'
import { useGetRoles } from '../role/api'
import { type Role } from '../role'

export default function DevRole() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [offset, setOffset] = useState(0)
  const [projectId, setProjectId] = useState('')

  const allProjectData = storage.getAllProjectStorage() || {}
  const transformProjectArr = (arr: any) => {
    const rs = arr.map((item: any) => {
      return {
        label: item.name,
        value: item.id,
      }
    })
    return rs
  }

  const [filteredComboboxData, setFilteredComboboxData] = useState<Role[]>([])

  const { data, isPreviousData } = useGetRoles({
    projectId,
    isHasApplicableTo: true,
  })

  return (
    <>
      <div
        className="border-secondary-700 mb-4 mr-auto flex cursor-pointer rounded-md border px-3 py-2 text-base font-medium"
        onClick={() => navigate(-1)}
      >
        <img src={narrowLeft} alt="left" className="aspect-square w-[20px]" />
        <span className="ml-2">{t('form:back')}</span>
      </div>
      <SelectField
        label="Project Id"
        className="mb-4 ml-32 w-max"
        options={transformProjectArr(allProjectData.projects)}
        onChange={e => {
          setProjectId(e.target.value)
        }}
        classlabel="ml-32"
      />

      <TitleBar title="Danh sách dev role" className="mx-32" />
      <div className="mx-32 flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-end">
          {projectId && (
            <div className="flex items-center gap-x-3">
              <CreateRole project_id={projectId} />
              <ComboBoxSelectRole
                data={data?.roles || []}
                setFilteredComboboxData={setFilteredComboboxData}
              />
            </div>
          )}
        </div>
        {projectId && (
          <RoleTable
            data={filteredComboboxData}
            offset={offset}
            setOffset={setOffset}
            total={0}
            isPreviousData={isPreviousData}
          />
        )}
      </div>
    </>
  )
}
