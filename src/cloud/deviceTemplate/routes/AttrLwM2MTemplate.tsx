import { useParams } from 'react-router-dom'
import { Suspense, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { TemplateInfo, TemplateSidebar } from '../components'
import { ContentLayout } from '~/layout/ContentLayout'
import { Spinner } from '~/components/Spinner'
import storage from '~/utils/storage'

import { type TransportConfigAttribute } from '../types'
import { useTemplateLwM2MById } from '../api'
import { LwM2MTable } from '../components/LwM2MTable'
import { ComboBoxSelectModuleConfig } from '../components/ComboBoxSelectModuleConfig'
import { ComboBoxSelectAttrLwM2M } from '../components/ComboBoxSelectAttrLwM2M'
import { AttrLwM2MTable } from '../components/AttrLwM2MTable'

export function AttrLwM2MTemplate() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const [filteredComboboxData, setFilteredComboboxData] = useState<
  TransportConfigAttribute[]
  >([])
  const [offset, setOffset] = useState(0)
  const params = useParams()
  const templateId = params.templateId as string
  const projectId = storage.getProject()?.id
  console.log(templateId)
  return (
    <>
    
      <TitleBar
        title={
          t('cloud:device_template.info.attr') ??
          'Device template management'
        }
      />
      <div className="flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-end">
          <div className="flex items-center gap-x-3">
            {/* {isSuccess ? ( */}
              <ComboBoxSelectAttrLwM2M
                  setFilteredComboboxData={setFilteredComboboxData}
                  offset={offset}
              />
            {/* ) : null} */}
          </div>
        </div>
        <AttrLwM2MTable
          attribute_info={filteredComboboxData}
          //offset={offset}
          //setOffset={setOffset}
          //isPreviousData={isPreviousData}
        />
      </div>
    </>
  )
}
