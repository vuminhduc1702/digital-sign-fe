import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import clsx from 'clsx'
import { Menu } from '@headlessui/react'

import { useProjectIdStore } from '~/stores/project'
import { Button } from '~/components/Button'
import { Dropdown, MenuItem } from '~/components/Dropdown'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { useCopyId, useDisclosure } from '~/utils/hooks'
import { PATHS } from '~/routes/PATHS'
import CreateTemplate from './CreateTemplate'
import { useDeleteTemplate } from '../api'
import { UpdateTemplate } from './UpdateTemplate'
import { ComboBoxSelectTemplate } from './ComboBoxSelectTemplate'

import { type Template } from '../types'

import { BtnContextMenuIcon } from '~/components/SVGIcons'
import listIcon from '~/assets/icons/list.svg'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnCopyIdIcon from '~/assets/icons/btn-copy_id.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

export function TemplateSidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { close, open, isOpen } = useDisclosure()

  const { templateId } = useParams()

  const projectId = useProjectIdStore(state => state.projectId)

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
        <div className="flex gap-3">
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
        />
      </div>
      <div className="grow overflow-y-auto bg-secondary-500 p-3">
        {filteredComboboxData?.length > 0 ? (
          <div className="space-y-3">
            {filteredComboboxData?.map((template: Template) => (
              <div className="flex" key={template.id}>
                <Button
                  className={clsx('gap-y-3 rounded-l-md border-none px-4')}
                  key={template.id}
                  variant="muted"
                  size="no-p"
                  onClick={() =>
                    navigate(
                      `${PATHS.DEVICE_TEMPLATE}/${projectId}/${template.id}`,
                    )
                  }
                >
                  <p
                    className={clsx('my-auto', {
                      'text-primary-400': templateId === template.id,
                    })}
                  >
                    {template.name}
                  </p>
                </Button>
                <div className="flex items-center justify-center rounded-r-md bg-secondary-600">
                  <Dropdown
                    menuClass="h-10 w-6"
                    icon={
                      <BtnContextMenuIcon
                        height={20}
                        width={3}
                        viewBox="0 0 3 20"
                      />
                    }
                  >
                    <Menu.Items className="absolute left-0 z-10 mt-11 w-32 origin-top-right divide-y divide-secondary-400 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-1 py-1">
                        <MenuItem
                          icon={
                            <img
                              src={btnEditIcon}
                              alt="Edit template"
                              className="h-5 w-5"
                            />
                          }
                          onClick={() => {
                            open()
                            setSelectedUpdateTemplate(template)
                          }}
                        >
                          {t('cloud:device_template.sidebar.edit')}
                        </MenuItem>
                        <MenuItem
                          icon={
                            <img
                              src={btnCopyIdIcon}
                              alt="Copy template's ID"
                              className="h-5 w-5"
                            />
                          }
                          onClick={() => handleCopyId(template.id)}
                        >
                          {t('table:copy_id')}
                        </MenuItem>
                        <ConfirmationDialog
                          isDone={isSuccess}
                          icon="danger"
                          title={t(
                            'cloud:device_template.sidebar.delete_template_full',
                          )}
                          body={
                            t(
                              'cloud:device_template.sidebar.delete_template_confirm',
                            ).replace('{{TEMPLATENAME}}', template.name) ??
                            'Confirm delete?'
                          }
                          triggerButton={
                            <Button
                              className="w-full border-none hover:text-primary-400"
                              style={{ justifyContent: 'flex-start' }}
                              variant="trans"
                              size="square"
                              startIcon={
                                <img
                                  src={btnDeleteIcon}
                                  alt="Delete template"
                                  className="h-5 w-5"
                                />
                              }
                            >
                              {t(
                                'cloud:device_template.sidebar.delete_template',
                              )}
                            </Button>
                          }
                          confirmButton={
                            <Button
                              isLoading={isLoading}
                              type="button"
                              size="md"
                              className="bg-primary-400"
                              onClick={() => mutate({ id: template.id })}
                              startIcon={
                                <img
                                  src={btnSubmitIcon}
                                  alt="Submit"
                                  className="h-5 w-5"
                                />
                              }
                            />
                          }
                        />
                      </div>
                    </Menu.Items>
                  </Dropdown>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            {t('cloud:device_template.sidebar.no_template')}
          </div>
        )}
        {selectedUpdateTemplate != null ? (
          <UpdateTemplate
            close={close}
            isOpen={isOpen}
            selectedUpdateTemplate={selectedUpdateTemplate}
          />
        ) : null}
      </div>
    </>
  )
}
