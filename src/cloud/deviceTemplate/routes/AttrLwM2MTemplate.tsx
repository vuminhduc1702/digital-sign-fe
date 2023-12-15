import { useParams } from 'react-router-dom'
import { Suspense, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { TemplateInfo, TemplateSidebar } from '../components'
import {
  AttrTable,
  ComboBoxSelectAttr,
  CreateAttr,
} from '~/cloud/orgManagement/components/Attributes'
import {
    ComboBoxSelectThing,
    CreateThing,
    ThingTable,
  } from '~/cloud/flowEngineV2/components/Attributes'
import { ContentLayout } from '~/layout/ContentLayout'
import { Spinner } from '~/components/Spinner'
import storage from '~/utils/storage'

import { type TemplateLwM2M, type ModuleConfig } from '../types'
import { useTemplateLwM2MById } from '../api'
import { LwM2MTable } from '../components/LwM2MTable'
import { ComboBoxSelectModuleConfig } from '../components/ComboBoxSelectModuleConfig'
//import { AttrLwM2MTemplate } from './AttrLwM2MTemplate'

export function AttrLwM2MTemplate() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const [filteredComboboxData, setFilteredComboboxData] = useState<
  ModuleConfig[]
  >([])
  const [offset, setOffset] = useState(0)
  const params = useParams()
  const templateId = params.templateId as string
  const projectId = storage.getProject()?.id
  const {
    data: LwM2MDataById,
    isPreviousData,
    isSuccess,} = useTemplateLwM2MById ({ templateId })
  console.log('data12', LwM2MDataById)
  console.log('filteredComboboxData', filteredComboboxData)
  return (
    <ContentLayout title={t('sidebar:cloud.device_template')}>
      <div className="grid grow grid-cols-1 gap-x-4 md:grid-cols-3">
        <div className="flex grow flex-col gap-2 md:col-span-1">
          <TemplateSidebar />
        </div>

        {projectId && templateId ? (
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
                  <div className="flex items-center gap-x-3">
                    <CreateAttr entityId={templateId} entityType="TEMPLATE" />
                    {isSuccess ? (
                        <ComboBoxSelectModuleConfig
                        data={LwM2MDataById?.transport_config?.info}
                        setFilteredComboboxData={setFilteredComboboxData}
                        offset={offset}
                        />
                    ) : null}
                  </div>
                </div>
                <LwM2MTable
                  module_config={filteredComboboxData}
                  //offset={offset}
                  //setOffset={setOffset}
                  //isPreviousData={isPreviousData}
                />
              </div>
            </Suspense>
          </div>
        ) : null}
      </div>
    </ContentLayout>
  )
}