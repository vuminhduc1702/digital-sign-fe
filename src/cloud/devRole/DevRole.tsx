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
  const [isSearchData, setIsSearchData] = useState<boolean>(false)

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

  const { data, isLoading, isPreviousData } = useGetRoles({
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

      <div className="mx-32">
        <TitleBar title={t('dev_role:list')} />
        <div className="relative flex grow flex-col gap-10 px-9 py-3 shadow-lg">
          <div className="flex justify-end">
            {projectId && (
              <div className="flex w-full items-center justify-between gap-x-3">
                <SearchField
                  setSearchValue={setSearchQuery}
                  setIsSearchData={setIsSearchData}
                  closeSearch={true}
                />
                <CreateRole project_id={projectId} />
              </div>
            )}
          </div>
          {projectId && (
            <RoleTable
              data={data?.roles ?? []}
              offset={offset}
              setOffset={setOffset}
              total={data?.total ?? 0}
              isPreviousData={isPreviousData}
              isLoading={isLoading}
              isSearchData={searchQuery.length > 0 && isSearchData}
            />
          )}
        </div>
      </div>
    </ContentLayout>
  )
}
