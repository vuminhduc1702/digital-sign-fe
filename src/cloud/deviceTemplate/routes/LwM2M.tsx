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
import { flattenData } from '~/utils/misc'
import { InputField } from '~/components/Form'
import { SearchIcon } from '~/components/SVGIcons'
import { XMarkIcon } from '@heroicons/react/20/solid'

export function LwM2M() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const params = useParams()
  const templateId = params.templateId as string
  const id = params.id as string
  const projectId = storage.getProject()?.id

  const [searchQueryData, setSearchQueryData] = useState('')
  const [searchQueryDataAttr, setSearchQueryDataAttr] = useState('')

  // no offset call
  const {
    data: LwM2MDataById,
    isPreviousData: isPreviousLwM2MData,
    isSuccess,
  } = useTemplateById({ templateId })
  const { acc: templateLwM2MFlattenData } = flattenData(
    LwM2MDataById?.transport_config?.info?.module_config || [],
    ['numberOfAttributes', 'module_name', 'id'],
  )

  const selectedModuleId = id
  const selectedModule =
    LwM2MDataById?.transport_config?.info.module_config.find(
      module => module.id === selectedModuleId,
    )
  const selectedAttributes = selectedModule?.attribute_info || []
  const { acc: templateLwM2MFlattenDataAttr } = flattenData(
    selectedAttributes,
    ['action', 'name', 'id', 'kind', 'type'],
  )

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
                  {/* dummyInput */}
                  <InputField
                    type="text"
                    placeholder={t('table:search')}
                    value={searchQueryData}
                    onChange={e => {
                      const value = e.target.value
                      setSearchQueryData(value)
                    }}
                    endIcon={
                      <div className="absolute top-1/2 right-2 -translate-y-1/2 transform flex justify-center">
                        {searchQueryData.length > 0 && (
                          <XMarkIcon
                            className="h-[16px] w-[16px] mr-[5px] transform cursor-pointer opacity-50 flex align-center justify-center cursor-pointer"
                            onClick={() => setSearchQueryData('')}
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
              </div>
              <LwM2MTable moduleConfig={templateLwM2MFlattenData} />
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
                  {/* dummyInput */}
                  <InputField
                    type="text"
                    placeholder={t('table:search')}
                    value={searchQueryDataAttr}
                    onChange={e => {
                      const value = e.target.value
                      setSearchQueryDataAttr(value)
                    }}
                    endIcon={
                      <div className="absolute top-1/2 right-2 -translate-y-1/2 transform flex justify-center">
                        {searchQueryDataAttr.length > 0 && (
                          <XMarkIcon
                            className="h-[16px] w-[16px] mr-[5px] transform cursor-pointer opacity-50 flex align-center justify-center cursor-pointer"
                            onClick={() => setSearchQueryDataAttr('')}
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
              </div>
              <AttrLwM2MTable attributeInfo={templateLwM2MFlattenDataAttr} />
            </div>
          </Suspense>
        </div>
      ) : null}
    </div>
  )
}
