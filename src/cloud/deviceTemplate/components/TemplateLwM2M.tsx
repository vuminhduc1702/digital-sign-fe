import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import clsx from 'clsx'
import { Menu } from '@headlessui/react'

import { Button } from '~/components/Button'
import { Dropdown, MenuItem } from '~/components/Dropdown'
import { useCopyId, useDisclosure } from '~/utils/hooks'
import { PATHS } from '~/routes/PATHS'
import CreateTemplateLwM2M from './CreateTemplateLwM2M'
import { useDeleteTemplate } from '../api'
import { ComboBoxSelectTemplateLwM2M } from './ComboBoxSelectTemplateLwM2M'
import storage from '~/utils/storage'

import { type Template } from '../types'

import { BtnContextMenuIcon } from '~/components/SVGIcons'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnCopyIdIcon from '~/assets/icons/btn-copy_id.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { UpdateTemplateLwM2M } from './UpdateTemplateLwM2M'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/Dropdowns'
import { ConfirmDialog } from '~/components/ConfirmDialog'

export function TemplateLwM2M() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [id, setId] = useState('')

  const { close, open, isOpen } = useDisclosure()
  const {
    close: closeDelete,
    open: openDelete,
    isOpen: isOpenDelete,
  } = useDisclosure()

  const { templateId } = useParams()

  const { id: projectId } = storage.getProject()

  const { mutate, isLoading, isSuccess } = useDeleteTemplate()
  const [showNoTemplateMessage, setShowNoTemplateMessage] = useState(false)
  const [selectedUpdateTemplate, setSelectedUpdateTemplate] =
    useState<Template>()
  const [filteredComboboxData, setFilteredComboboxData] = useState<Template[]>(
    [],
  )
  const handleCopyId = useCopyId()
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNoTemplateMessage(true)
    }, 500)
    if (filteredComboboxData?.[0]?.id) {
      navigate(
        `${PATHS.TEMPLATE_LWM2M}/${projectId}/${filteredComboboxData[0].id}`,
      )
    }
    return () => clearTimeout(timer)
  }, [filteredComboboxData])

  useEffect(() => {
    if (isSuccess) {
      closeDelete()
    }
  }, [isSuccess])

  return (
    <>
      <div className="flex h-[60px] items-center gap-2 bg-secondary-400 px-4 py-3">
        <CreateTemplateLwM2M />
        <ComboBoxSelectTemplateLwM2M
          setFilteredComboboxData={setFilteredComboboxData}
        />
      </div>
      <div className="h-[70vh] grow overflow-y-auto bg-secondary-500 p-3">
        {filteredComboboxData !== null && filteredComboboxData?.length > 0 ? (
          <div className="space-y-3">
            {filteredComboboxData?.map((template: Template) => (
              <div className="flex" key={template.id}>
                <Button
                  className={clsx('gap-y-3 rounded-l-md border-none px-4 py-0')}
                  key={template.id}
                  variant="muted"
                  onClick={() =>
                    navigate(
                      `${PATHS.TEMPLATE_LWM2M}/${projectId}/${template.id}`,
                    )
                  }
                >
                  <p
                    className={clsx('my-auto', {
                      'text-primary-400': templateId === template.id,
                    })}
                  >
                    {template?.name}
                  </p>
                </Button>
                <div className="flex items-center justify-center rounded-r-md bg-secondary-600">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <div className="flex h-10 w-6 items-center justify-center rounded-md text-body-sm text-white hover:bg-opacity-30 hover:text-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                        <BtnContextMenuIcon
                          height={20}
                          width={3}
                          viewBox="0 0 3 20"
                        />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          open()
                          setSelectedUpdateTemplate(template)
                        }}
                      >
                        <img
                          src={btnEditIcon}
                          alt="Edit template"
                          className="h-5 w-5"
                        />
                        {t('cloud:device_template.sidebar.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleCopyId(template.id)}
                      >
                        <img
                          src={btnCopyIdIcon}
                          alt="Copy template's ID"
                          className="h-5 w-5"
                        />
                        {t('table:copy_id')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          openDelete()
                          setId(template.id)
                          setName(template.name)
                        }}
                      >
                        <img
                          src={btnDeleteIcon}
                          alt="Delete template"
                          className="h-5 w-5"
                        />
                        {t('cloud:device_template.sidebar.delete_template')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            {showNoTemplateMessage &&
              t('cloud:device_template.sidebar.no_template')}
          </div>
        )}
        {isOpen && selectedUpdateTemplate ? (
          <UpdateTemplateLwM2M
            close={close}
            isOpen={isOpen}
            selectedUpdateTemplate={selectedUpdateTemplate}
          />
        ) : null}
      </div>
      {isOpenDelete ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:device_template.sidebar.delete_template_full')}
          body={t(
            'cloud:device_template.sidebar.delete_template_confirm',
          ).replace('{{TEMPLATENAME}}', name)}
          close={closeDelete}
          isOpen={isOpenDelete}
          handleSubmit={() => mutate({ id })}
          isLoading={isLoading}
        />
      ) : null}
    </>
  )
}
