import clsx from 'clsx'
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/Button'
import { PATHS } from '@/routes/PATHS'
import { useCopyId, useDisclosure } from '@/utils/hooks'
import storage from '@/utils/storage'
import { useDeleteDataBase } from '../api'
import CreateDataBase from './CreateDataBase'

import { type DataBase } from '../types'

import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import listIcon from '@/assets/icons/list.svg'
import { BtnContextMenuIcon } from '@/components/SVGIcons'
import { useGetDataBases } from '../api/getDataBases'
import { flattenData } from '@/utils/misc'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/Dropdowns'
import { SearchField } from '@/components/Input'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export function DataBaseSidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [name, setName] = useState('')

  const {
    close: closeDelete,
    open: openDelete,
    isOpen: isOpenDelete,
  } = useDisclosure()

  const { tableName } = useParams()

  const projectId = storage.getProject()?.id

  const { mutate, isLoading, isSuccess } = useDeleteDataBase()

  const { data } = useGetDataBases({
    projectId,
    search_field: 'name',
    search_str: searchQuery,
  })

  const { acc: templateFlattenData, extractedPropertyKeys } = flattenData(
    data?.data,
    ['id', 'table_name'],
  )

  useEffect(() => {
    if (isSuccess) {
      navigate(`${PATHS.DB_TEMPLATE}/${projectId}`)
      closeDelete()
    }
  }, [isSuccess])

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
        <SearchField setSearchValue={setSearchQuery} />
      </div>
      <div className="h-[82vh] grow overflow-y-auto bg-secondary-500 p-3">
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
                <div className="flex items-center justify-center rounded-r-md bg-secondary-600">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild className="cursor-pointer">
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
                          openDelete()
                          setName(table?.table_name)
                        }}
                      >
                        <img
                          src={btnDeleteIcon}
                          alt="Delete db"
                          className="h-5 w-5"
                        />
                        {t('cloud:db_template.sidebar.delete_db')}
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
      {isOpenDelete && name ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:db_template.sidebar.delete_db')}
          body={t('cloud:db_template.sidebar.delete_db_confirm').replace(
            '{{DBNAME}}',
            name,
          )}
          close={closeDelete}
          isOpen={isOpenDelete}
          handleSubmit={() =>
            mutate({
              table: name,
              project_id: projectId,
            })
          }
          isLoading={isLoading}
        />
      ) : null}
    </>
  )
}
