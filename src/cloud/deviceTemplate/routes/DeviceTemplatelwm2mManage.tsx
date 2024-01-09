import { useParams } from 'react-router-dom'
import { Suspense, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { TemplateInfo, TemplateSidebar } from '../components'
import { ContentLayout } from '~/layout/ContentLayout'
import { Spinner } from '~/components/Spinner'
import storage from '~/utils/storage'

import { type TransportConfigAttribute, type ModuleConfig } from '../types'
import { LwM2MTable } from '../components/LwM2MTable'
import { ComboBoxSelectModuleConfig } from '../components/ComboBoxSelectModuleConfig'
import { ComboBoxSelectAttrLwM2M } from '../components/ComboBoxSelectAttrLwM2M'
import { AttrLwM2MTable } from '../components/AttrLwM2MTable'

export function DeviceTemplatelwm2mManage() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const [filteredComboboxData, setFilteredComboboxData] = useState<
  ModuleConfig[]
  >([])
  const [filteredComboboxDataAttr, setFilteredComboboxDataAttr] = useState<
  TransportConfigAttribute[]
  >([])
  const [offset] = useState(0)
  const params = useParams()
  const templateId = params.templateId as string
  const id = params.id as string
  const projectId = storage.getProject()?.id
  return (
    <ContentLayout title={t('sidebar:cloud.device_template')}>
      <div className="grid grow grid-cols-1 gap-x-4 md:grid-cols-3">
        <div className="flex grow flex-col gap-2 md:col-span-1">
          <TemplateSidebar />
        </div>
        {projectId && templateId && !id ? (
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
                  <div className="flex items-center gap-x-3">
                    <ComboBoxSelectModuleConfig
                      setFilteredComboboxData={setFilteredComboboxData}
                      offset={offset}
                    />
                  </div>
                </div>
                <LwM2MTable
                  module_config={filteredComboboxData}
                />
              </div>
            </Suspense>
          </div>
        ) : null}
        {projectId && templateId && id ? (
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
                      <ComboBoxSelectAttrLwM2M
                      setFilteredComboboxDataAttr={setFilteredComboboxDataAttr}
                      offset={offset}
                    />
                    </div>
                  </div>
                  <AttrLwM2MTable
                    attribute_info={filteredComboboxDataAttr}
                  />
                  </div>
            </Suspense>
          </div> 
        ) : null}
      </div>
    </ContentLayout>
  )
}
