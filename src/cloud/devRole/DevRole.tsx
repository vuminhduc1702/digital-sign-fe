import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { SelectField } from '@/components/Form'
import TitleBar from '@/components/Head/TitleBar'
import { RoleTable } from '../role/components/RoleTable'
import { CreateRole } from '../role/components'
import { useGetRoles } from '../role/api'
import { useProjects } from '../project/api'
import storage from '@/utils/storage'
import { ContentLayout } from '@/layout/ContentLayout'
import { SearchField } from '@/components/Input'

import { type Project } from '../project/routes/ProjectManage'

import narrowLeft from '@/assets/icons/narrow-left.svg'

export default function DevRole() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [offset, setOffset] = useState(0)
  const [projectId, setProjectId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchData, setIsSearchData] = useState<boolean>(false)

  const { data: projectsData } = useProjects()

  const transformProjectArr = (arr: Project[]) => {
    const rs = arr.map(item => {
      return {
        label: item.name,
        value: item.id,
      }
    })
    return rs
  }

  const { data, isLoading, isPreviousData } = useGetRoles({
    projectId,
    applicable_to: 'TENANT_DEV',
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

  const [rowSelection, setRowSelection] = useState({})
  const pdfHeader = useMemo(
    () => [
      t('table:no'),
      t('cloud:role_manage.add_role.name'),
      t('cloud:role_manage.add_role.role_type'),
      t('cloud:role_manage.add_role.actions'),
    ],
    [],
  )
  const rowSelectionKey = Object.keys(rowSelection)
  const formatExcel = data?.roles?.reduce(
    (acc, curr, index) => {
      if (rowSelectionKey.includes(curr.id)) {
        const temp = {
          [t('table:no')]: (index + 1 + offset).toString(),
          [t('cloud:role_manage.add_role.name')]: curr.name,
          [t('cloud:role_manage.add_role.role_type')]: curr.role_type,
          [t('cloud:role_manage.add_role.actions')]: curr.actions,
        }
      }
      return acc
    },
    [] as Array<{ [key: string]: string }>,
  )

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
        options={transformProjectArr(projectsData?.projects ?? [])}
        onChange={e => setProjectId(e.target.value)}
        defaultValue={storage.getProject()?.id}
      />

      <div className="mx-32">
        <TitleBar title={t('dev_role:list')} />
        <div className="relative flex h-full grow flex-col gap-5 px-9 py-3 shadow-lg">
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
              project_id={projectId}
              offset={offset}
              setOffset={setOffset}
              total={data?.total ?? 0}
              isPreviousData={isPreviousData}
              isLoading={isLoading}
              isSearchData={searchQuery.length > 0 && isSearchData}
              pdfHeader={pdfHeader}
              formatExcel={formatExcel}
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
            />
          )}
        </div>
      </div>
    </ContentLayout>
  )
}
