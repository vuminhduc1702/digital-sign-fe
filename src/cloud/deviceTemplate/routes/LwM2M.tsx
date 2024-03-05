import { Suspense, useRef, useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import TitleBar from '~/components/Head/TitleBar'
import { Spinner } from '~/components/Spinner'
import { ExportTable } from '~/components/Table/components/ExportTable'
import storage from '~/utils/storage'
import { TemplateInfo } from '../components'

import { AttrLwM2MTable } from '../components/AttrLwM2MTable'
import { LwM2MTable } from '../components/LwM2MTable'
import { useTemplateById } from '../api/getTemplateById'
import { SearchField } from '~/components/Input'

export function LwM2M() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const params = useParams()
  const templateId = params.templateId as string
  const selectedModuleId = params.id as string
  const projectId = storage.getProject()?.id

  const [searchQueryData, setSearchQueryData] = useState('')
  const [searchQueryDataAttr, setSearchQueryDataAttr] = useState('')

  // LwM2MData
  const {
    data: LwM2MDataById,
    isPreviousData: isPreviousLwM2MDataById,
    isSuccess,
  } = useTemplateById({
    templateId,
    config: {
      suspense: false,
    },
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
  const aoo: Array<{ [key: string]: string }> | undefined =
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
      [] as Array<{ [key: string]: string }>,
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
  const aooAttr: Array<{ [key: string]: string }> | undefined =
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
      [] as Array<{ [key: string]: string }>,
    )

  return (
    <div ref={ref} className="grid grow grid-cols-1 gap-x-4">
      {projectId && templateId && !selectedModuleId ? (
        <div ref={ref} className="flex flex-col gap-2 md:col-span-2">
          <Suspense
            fallback={
              <div className="flex grow items-center justify-center md:col-span-2">
                <Spinner size="xl" />
              </div>
            }
          >
            <TemplateInfo />
            <TitleBar
              title={
                t('cloud:device_template.info.listattr') ??
                'Device template management'
              }
            />
            <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
              <div className="flex justify-between">
                <ExportTable
                  refComponent={ref}
                  rowSelection={rowSelection}
                  aoo={aoo}
                  pdfHeader={pdfHeader}
                />
                <div className="mr-[42px] flex items-center gap-x-3">
                  <SearchField
                    searchQuery={searchQueryData}
                    setSearchQuery={setSearchQueryData}
                  />
                </div>
              </div>
              <LwM2MTable
                moduleConfig={
                  LwM2MDataById?.transport_config?.info?.module_config ?? []
                }
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
              />
            </div>
          </Suspense>
        </div>
      ) : null}
      {projectId && templateId && selectedModuleId ? (
        <div ref={ref} className="flex flex-col gap-2 md:col-span-2">
          <Suspense
            fallback={
              <div className="flex grow items-center justify-center md:col-span-2">
                <Spinner size="xl" />
              </div>
            }
          >
            <TemplateInfo />
            <TitleBar
              title={
                t('cloud:device_template.info.attr') ??
                'Device template management'
              }
            />
            <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
              <div className="flex justify-between">
                <ExportTable
                  refComponent={ref}
                  rowSelection={rowSelectionAttr}
                  aoo={aooAttr}
                  pdfHeader={pdfHeaderAttr}
                />
                <div className="mr-[42px] flex items-center gap-x-3">
                  <SearchField
                    searchQuery={searchQueryDataAttr}
                    setSearchQuery={setSearchQueryDataAttr}
                  />
                </div>
              </div>
              <AttrLwM2MTable
                attributeInfo={selectedModule?.attribute_info ?? []}
                rowSelection={rowSelectionAttr}
                setRowSelection={setRowSelectionAttr}
              />
            </div>
          </Suspense>
        </div>
      ) : null}
    </div>
  )
}
