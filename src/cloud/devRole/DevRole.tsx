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

import narrowLeft from '~/assets/icons/narrow-left.svg'
import { ContentLayout } from '~/layout/ContentLayout'
import { SearchField } from '~/components/Input'

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

  useEffect(() => {
    if (storage.getProject() != null) {
      setProjectId(storage.getProject().id)
    }
  }, [])

  return (
    <ContentLayout title={t('dev_role:title')}>
      <div
        className="mb-4 mr-auto flex cursor-pointer rounded-md border border-secondary-700 px-3 py-2 text-base font-medium"
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
            <div className="mr-[42px] flex items-center gap-x-3">
              <CreateRole project_id={projectId} />
              <SearchField
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>
          )}
        </div>
        {projectId && (
          <RoleTable
            data={data?.roles ?? []}
            project_id={projectId}
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
