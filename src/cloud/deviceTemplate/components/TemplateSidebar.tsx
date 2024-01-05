import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useCopyId, useDisclosure } from '~/utils/hooks'
import { cn } from '~/utils/misc'
import storage from '~/utils/storage'
import { useDeleteTemplate } from '../api'

import { type Template } from '../types'

import { TemplateDefault } from './TemplateDefault'
import { TemplateLwM2M } from './TemplateLwM2M'

export function TemplateSidebar() {
  const { t } = useTranslation()
  const [type, setType] = useState('Default')
  const navigate = useNavigate()
  const DeviceType = ['Default', 'LwM2M']
  const { close, open, isOpen } = useDisclosure()

  const { templateId } = useParams()

  const projectId = storage.getProject()?.id

  const { mutate, isLoading, isSuccess } = useDeleteTemplate()

  const [selectedUpdateTemplate, setSelectedUpdateTemplate] =
    useState<Template>()
  const [filteredComboboxData, setFilteredComboboxData] = useState<Template[]>(
    [],
  )

  const handleCopyId = useCopyId()

  return (
    <>
      <div className="flex h-[60px] items-center gap-2 bg-secondary-400 px-4 py-3">
        {/* <div className="flex gap-3">
          <img
            src={listIcon}
            alt="Template list"
            className="aspect-square w-[20px]"
          />
          <p>{t('cloud:device_template.sidebar.title')}</p>
        </div>
        <CreateTemplate />
        <ComboBoxSelectTemplate
          setFilteredComboboxData={setFilteredComboboxData}
        /> */}
        <div className="w-fit rounded-2xl bg-slate-200">
            {DeviceType.map(item => {
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setType(item)
                  }}
                  className={cn('px-4 py-2 text-slate-400', {
                    'bg-primary-400 rounded-2xl text-white': type === item,
                  })}
                >
                  {item}
                </button>
              )
            })}
        </div>
      </div>
      <div className="h-[80vh] grow overflow-y-auto bg-secondary-500 p-3">
      {type === 'Default' ? (
            <TemplateDefault
              // data={lastView || []}
              // offset={offset}
              // setOffset={setOffset}
              // total={0}
              // isPreviousData={isPreviousData}
            />
          ) : (
            <TemplateLwM2M
              // data={starred || []}
              // offset={offset}
              // setOffset={setOffset}
              // total={0}
              // isPreviousData={isPreviousData}
            />
          )}
      </div>
    </>
  )
}
