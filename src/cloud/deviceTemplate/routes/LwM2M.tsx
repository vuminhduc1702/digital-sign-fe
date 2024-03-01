import { Suspense, useRef, useState } from 'react'
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

  // no offset call
  const {
    data: LwM2MDataById,
    isPreviousData: isPreviousLwM2MData,
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

  return (
    <div className="grid grow grid-cols-1 gap-x-4">
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
                <ExportTable refComponent={ref} />
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
                <ExportTable refComponent={ref} />
                <div className="mr-[42px] flex items-center gap-x-3">
                  <SearchField
                    searchQuery={searchQueryDataAttr}
                    setSearchQuery={setSearchQueryDataAttr}
                  />
                </div>
              </div>
              <AttrLwM2MTable
                attributeInfo={selectedModule?.attribute_info ?? []}
              />
            </div>
          </Suspense>
        </div>
      ) : null}
    </div>
  )
}
