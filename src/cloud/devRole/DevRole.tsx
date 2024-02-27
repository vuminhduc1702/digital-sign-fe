import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { SelectField } from '~/components/Form'
import TitleBar from '~/components/Head/TitleBar'
import { RoleTable } from '../role/components/RoleTable'
import { CreateRole } from '../role/components'
import { useGetRoles } from '../role/api'
import { useProjects } from '../project/api'
import storage from '~/utils/storage'
import { flattenData } from '~/utils/misc'

import { type Role } from '../role'

import narrowLeft from '~/assets/icons/narrow-left.svg'
import { ContentLayout } from '~/layout/ContentLayout'
import { InputField } from '~/components/Form'
import { SearchIcon } from '~/components/SVGIcons'
import { XMarkIcon } from '@heroicons/react/20/solid'

export default function DevRole() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [offset, setOffset] = useState(0)
  const [projectId, setProjectId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: projectsData } = useProjects()

  const transformProjectArr = (arr: any) => {
    const rs = arr.map((item: any) => {
      return {
        label: item.name,
        value: item.id,
      }
    })
    return rs
  }

  const { data, isPreviousData } = useGetRoles({
    projectId,
    isHasApplicableTo: true,
    config: {
      keepPreviousData: true,
      suspense: false,
    },
    offset, 
  })

  const { acc: roleFlattenData, extractedPropertyKeys } = flattenData(data?.roles, [
    'id',
    'name',
    'policies',
    'role_type',
  ])

  useEffect(() => {
    if (storage.getProject() != null) {
      setProjectId(storage.getProject().id)
    }
  }, [])

  return (
    <ContentLayout title={t('dev_role:title')}>
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
        classlabel="ml-32"
        options={transformProjectArr(projectsData?.projects)}
        onChange={e => setProjectId(e.target.value)}
        defaultValue={storage.getProject()?.id}
      />

      <TitleBar title={t('dev_role:list')} className="mx-32" />
      <div className="relative mx-32 flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-end">
          {projectId && (
            <div className="flex items-center gap-x-3">
              <CreateRole project_id={projectId} />
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
          )}
        </div>
        {projectId && (
          <RoleTable
            project_id={projectId}
            data={roleFlattenData}
            offset={offset}
            setOffset={setOffset}
            total={data?.total ?? 0}
            isPreviousData={isPreviousData}
          />
        )}
      </div>
    </ContentLayout>
  )
}
