import { Menu } from '@headlessui/react'
import clsx from 'clsx'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '~/components/Button'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Dropdown } from '~/components/Dropdown'
import { PATHS } from '~/routes/PATHS'
import { useCopyId, useDisclosure } from '~/utils/hooks'
import storage from '~/utils/storage'
import { useDeleteDataBase } from '../api'
import CreateDataBase from './CreateDataBase'

import { type DataBase } from '../types'

import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import listIcon from '~/assets/icons/list.svg'
import { BtnContextMenuIcon } from '~/components/SVGIcons'
import { useGetDataBases } from '../api/getDataBases'
import { flattenData } from '~/utils/misc'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/Dropdowns'
import { SearchField } from '~/components/Input'

export function DataBaseSidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const { close, open, isOpen } = useDisclosure()

  const { tableName } = useParams()

  const projectId = storage.getProject()?.id

  const { mutate, isLoading, isSuccess } = useDeleteDataBase()

  const { data } = useGetDataBases({ projectId })

  const { acc: templateFlattenData, extractedPropertyKeys } = flattenData(
    data?.data,
    ['id', 'table_name'],
  )

  useEffect(() => {
    if (isSuccess)
      navigate(`${PATHS.DB_TEMPLATE}/${projectId}`)
  }, [isSuccess])

  return (
    <>
      <div className="bg-secondary-400 flex h-[60px] items-center gap-2 px-4 py-3">
        <div className="flex gap-3">
          <img
            src={listIcon}
            alt="Template list"
            className="aspect-square w-[20px]"
          />
          <p>{t('cloud:db_template.sidebar.title')}</p>
        </div>
        <CreateDataBase />
        <SearchField
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>
      <div className="bg-secondary-500 h-[82vh] grow overflow-y-auto p-3">
        {templateFlattenData?.length > 0 ? (
          <div className="space-y-3">
            {templateFlattenData?.map((table: DataBase) => (
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
                <div className="bg-secondary-600 flex items-center justify-center rounded-r-md">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild className='cursor-pointer'>
                      <div className="h-10 w-6 flex items-center justify-center rounded-md text-body-sm text-white hover:bg-opacity-30 hover:text-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                        <BtnContextMenuIcon height={20} width={3} viewBox="0 0 3 20" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <ConfirmationDialog
                          isDone={isSuccess}
                          icon="danger"
                          title={t('cloud:db_template.sidebar.delete_db')}
                          body={
                            t(
                              'cloud:db_template.sidebar.delete_db_confirm',
                            ).replace('{{DBNAME}}', table.table_name) ??
                            'Confirm delete?'
                          }
                          triggerButton={
                            <Button
                              className="hover:text-primary-400 w-full justify-start p-0 border-none shadow-none"
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
                              {t('cloud:db_template.sidebar.delete_db')}
                            </Button>
                          }
                          confirmButton={
                            <Button
                              isLoading={isLoading}
                              type="button"
                              size="md"
                              className="bg-primary-400"
                              onClick={() =>
                                mutate({
                                  table: table.table_name,
                                  project_id: projectId,
                                })
                              }
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
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
