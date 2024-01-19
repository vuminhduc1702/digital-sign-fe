import { Menu } from '@headlessui/react'
import clsx from 'clsx'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '~/components/Button'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Dropdown } from '~/components/Dropdown'
import { PATHS } from '~/routes/PATHS'
import { useCopyId, useDisclosure } from '~/utils/hooks'
import storage from '~/utils/storage'
import { useDeleteDataBase } from '../api'
import { ComboBoxSelectDataBase } from './ComboBoxSelectDataBase'
import CreateDataBase from './CreateDataBase'

import { type DataBase } from '../types'

import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import listIcon from '~/assets/icons/list.svg'
import { BtnContextMenuIcon } from '~/components/SVGIcons'

export function DataBaseSidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { close, open, isOpen } = useDisclosure()

  const { tableName } = useParams()

  const projectId = storage.getProject()?.id

  const { mutate, isLoading, isSuccess } = useDeleteDataBase()

  const [selectedUpdateTemplate, setSelectedUpdateTemplate] =
    useState<DataBase>()
  const [filteredComboboxData, setFilteredComboboxData] = useState<DataBase[]>(
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
          <p>{t('cloud:db_template.sidebar.title')}</p>
        </div>
        <CreateDataBase />
        <ComboBoxSelectDataBase
          setFilteredComboboxData={setFilteredComboboxData}
        />
      </div>
      <div className="h-[82vh] grow overflow-y-auto bg-secondary-500 p-3">
        {filteredComboboxData?.length > 0 ? (
          <div className="space-y-3">
            {filteredComboboxData?.map((table: DataBase) => (
              <div className="flex" key={table.table_name}>
                <Button
                  className={clsx('gap-y-3 rounded-l-md border-none px-4 py-0')}
                  key={table.table_name}
                  variant="muted"
                  onClick={() =>
                    navigate(
                      `${PATHS.DB_TEMPLATE}/${projectId}/${table.table_name}`,
                    )
                  }
                >
                  <p
                    className={clsx('my-auto', {
                      'text-primary-400': tableName === table.table_name,
                    })}
                  >
                    {table?.table_name}
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
                    <Menu.Items className="absolute left-0 z-10 mt-11 w-40 origin-top-right divide-y divide-secondary-400 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="p-1">
                        <ConfirmationDialog
                          isDone={isSuccess}
                          icon="danger"
                          title={t(
                            'cloud:db_template.sidebar.delete_db',
                          )}
                          body={
                            t(
                              'cloud:db_template.sidebar.delete_db_confirm',
                            ).replace('{{DBNAME}}', table.table_name) ??
                            'Confirm delete?'
                          }
                          triggerButton={
                            <Button
                              className="w-full justify-start border-none hover:text-primary-400"
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
                                'cloud:db_template.sidebar.delete_db',
                              )}
                            </Button>
                          }
                          confirmButton={
                            <Button
                              isLoading={isLoading}
                              type="button"
                              size="md"
                              className="bg-primary-400"
                              onClick={() => mutate({ table: table.table_name, project_id: projectId })}
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
            {t('cloud:db_template.sidebar.no_db')}
          </div>
        )}
      </div>
    </>
  )
}
