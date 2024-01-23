import { Suspense, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import TitleBar from '~/components/Head/TitleBar'
import { Spinner } from '~/components/Spinner'
import { ExportTable } from '~/components/Table/components/ExportTable'
import storage from '~/utils/storage'
import { TemplateInfo } from '../components'

import { AttrLwM2MTable } from '../components/AttrLwM2MTable'
import { ComboBoxSelectAttrLwM2M } from '../components/ComboBoxSelectAttrLwM2M'
import { ComboBoxSelectModuleConfig } from '../components/ComboBoxSelectModuleConfig'
import { LwM2MTable } from '../components/LwM2MTable'
import { type ModuleConfig, type TransportConfigAttribute } from '../types'


export function LwM2M() {
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
      <div className="grid grow grid-cols-1 gap-x-4">
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
  )
}
