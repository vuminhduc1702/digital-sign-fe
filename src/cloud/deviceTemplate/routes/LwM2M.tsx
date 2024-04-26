import { useRef, useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import TitleBar from '@/components/Head/TitleBar'
import { ExportTable } from '@/components/Table/components/ExportTable'
import storage from '@/utils/storage'
import { TemplateInfo } from '../components'

import { AttrLwM2MTable } from '../components/AttrLwM2MTable'
import { LwM2MTable } from '../components/LwM2MTable'
import { useTemplateById } from '../api/getTemplateById'
import { SearchField } from '@/components/Input'
import { Button } from '@/components/Button'

export function LwM2M() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const params = useParams()
  const templateId = params.templateId as string
  const selectedModuleId = params.id as string
  const projectId = storage.getProject()?.id

  const [searchQuery, setSearchQuery] = useState('')
  const [searchQueryAttr, setSearchQueryAttr] = useState('')
  const [isSearchData, setIsSearchData] = useState<boolean>(false)
  const [isSearchDataAttr, setIsSearchDataAttr] = useState<boolean>(false)

  // LwM2MData
  const {
    data: LwM2MDataById,
    isPreviousData: isPreviousLwM2MDataById,
    isLoading: isLoadingLwM2MDataById,
  } = useTemplateById({
    templateId,
  })

  const selectedModule =
    LwM2MDataById?.transport_config?.info.module_config.find(
      module => module.id === selectedModuleId,
    )
  const selectedAttributes = selectedModule?.attribute_info || []

  const [rowSelection, setRowSelection] = useState({})
  const pdfHeader = useMemo(
    () => [
      t('table:no'),
      t('cloud:device_template.listLwM2M.name'),
      t('cloud:device_template.listLwM2M.id'),
      t('cloud:device_template.listLwM2M.numberAttr'),
    ],
    [],
  )
  const rowSelectionKey = Object.keys(rowSelection)
  const formatExcel =
    LwM2MDataById?.transport_config?.info?.module_config?.reduce(
      (acc, curr, index) => {
        if (rowSelectionKey.includes(curr.id)) {
          const temp = {
            [t('table:no')]: (index + 1).toString(),
            [t('cloud:device_template.listLwM2M.name')]: curr.module_name,
            [t('cloud:device_template.listLwM2M.id')]: curr.id,
            [t('cloud:device_template.listLwM2M.numberAttr')]:
              curr.numberOfAttributes,
          }
          acc.push(temp)
        }
        return acc
      },
      [] as Array<{ [key: string]: unknown }>,
    )

  // attrLwM2MData
  const [rowSelectionAttr, setRowSelectionAttr] = useState({})
  const pdfHeaderAttr = useMemo(
    () => [
      t('table:no'),
      t('cloud:org_manage.org_manage.table.attr_key'),
      t('cloud:org_manage.org_manage.table.value_type'),
      t('cloud:org_manage.org_manage.table.id'),
    ],
    [],
  )
  const rowSelectionKeyAttr = Object.keys(rowSelectionAttr)
  const formatExcelAttr =
    LwM2MDataById?.transport_config?.info?.module_config?.reduce(
      (acc, curr, index) => {
        curr.attribute_info?.forEach((attr, index) => {
          if (rowSelectionKeyAttr.includes(attr.id)) {
            const temp = {
              [t('table:no')]: (index + 1).toString(),
              [t('cloud:org_manage.org_manage.table.attr_key')]: attr.name,
              [t('cloud:org_manage.org_manage.table.value_type')]: attr.type,
              [t('cloud:org_manage.org_manage.table.id')]: attr.id,
            }
            acc.push(temp)
          }
        })
        return acc
      },
      [] as Array<{ [key: string]: unknown }>,
    )

  return (
    <div ref={ref} className="grid grow grid-cols-1 gap-x-4">
      {projectId && templateId && !selectedModuleId ? (
        <div ref={ref} className="flex flex-col gap-2 md:col-span-2">
          <TemplateInfo />
          <TitleBar
            title={
              t('cloud:device_template.info.listattr') ??
              'Device template management'
            }
          />
          <div className="relative flex h-full grow flex-col gap-5 px-9 py-3 shadow-lg">
            <div className="flex justify-between">
              <div className="flex w-full items-center justify-between gap-x-3">
                <SearchField
                  setSearchValue={setSearchQuery}
                  setIsSearchData={setIsSearchData}
                  closeSearch={true}
                />
              </div>
            </div>
            <LwM2MTable
              moduleConfig={
                LwM2MDataById?.transport_config?.info?.module_config ?? []
              }
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
              isPreviousData={isPreviousLwM2MDataById}
              isLoading={isLoadingLwM2MDataById}
              pdfHeader={pdfHeader}
              formatExcel={formatExcel}
              isSearchData={searchQuery.length > 0 && isSearchData}
            />
          </div>
        </div>
      ) : null}
      {projectId && templateId && selectedModuleId ? (
        <div ref={ref} className="flex flex-col gap-2 md:col-span-2">
          <TemplateInfo />
          <TitleBar
            title={
              t('cloud:device_template.info.attr') ??
              'Device template management'
            }
          />
          <div className="relative flex h-full grow flex-col gap-5 px-9 py-3 shadow-lg">
            <div className="flex justify-between">
              <div className="flex w-full items-center justify-between gap-x-3">
                <SearchField
                  setSearchValue={setSearchQueryAttr}
                  setIsSearchData={setIsSearchDataAttr}
                  closeSearch={true}
                />
              </div>
            </div>
            <AttrLwM2MTable
              attributeInfo={selectedModule?.attribute_info ?? []}
              rowSelection={rowSelectionAttr}
              setRowSelection={setRowSelectionAttr}
              isPreviousData={isPreviousLwM2MDataById}
              isLoading={isLoadingLwM2MDataById}
              pdfHeader={pdfHeaderAttr}
              formatExcel={formatExcelAttr}
              isSearchData={searchQueryAttr.length > 0 && isSearchDataAttr}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
