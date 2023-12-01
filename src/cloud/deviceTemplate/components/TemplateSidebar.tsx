import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import clsx from 'clsx'
import { Menu } from '@headlessui/react'
import { cn } from '~/utils/misc'
import { Button } from '~/components/Button'
import { Dropdown, MenuItem } from '~/components/Dropdown'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { useCopyId, useDisclosure } from '~/utils/hooks'
import { PATHS } from '~/routes/PATHS'
import CreateTemplate from './CreateTemplate'
import { useDeleteTemplate } from '../api'
import { UpdateTemplate } from './UpdateTemplate'
import { ComboBoxSelectTemplate } from './ComboBoxSelectTemplate'
import storage from '~/utils/storage'

import { type Template } from '../types'

import { BtnContextMenuIcon } from '~/components/SVGIcons'
import listIcon from '~/assets/icons/list.svg'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnCopyIdIcon from '~/assets/icons/btn-copy_id.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { TemplateDefault } from './TemplateDefault'
import { TemplateLwM2M } from './TemplateLwM2M'

export function TemplateSidebar() {
  const { t } = useTranslation()
  const [type, setType] = useState('Generic')
  const navigate = useNavigate()
  const DeviceType = ['Default', 'LwM2M']
  const { close, open, isOpen } = useDisclosure()

  const { templateId } = useParams()

  const { id: projectId } = storage.getProject()

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
