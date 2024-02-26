import { Menu } from '@headlessui/react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { Button } from '~/components/Button'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Dropdown, MenuItem } from '~/components/Dropdown'
import { BtnContextMenuIcon } from '~/components/SVGIcons'
import { BaseTable } from '~/components/Table'
import { useDisclosure } from '~/utils/hooks'
import storage from '~/utils/storage'
import { useDeleteRow } from '../api/deleteRow'
import { type FieldsRows } from '../types'
import { UpdateRow } from './UpdateRow'
import { InputField } from '~/components/Form'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/Dropdowns'

function DataBaseTableContextMenu({
  row,
  onClose,
  ...props
}: {
  row: FieldsRows
  onClose: () => void
}) {
  const { t } = useTranslation()

  const { close, open, isOpen } = useDisclosure()
  const { tableName } = useParams()
  const projectId = storage.getProject()?.id

  const { mutate, isLoading, isSuccess } = useDeleteRow()

  useEffect(() => {
    if (isSuccess) {
      onClose()
    }
  }, [isSuccess])

  return (
    <>
<<<<<<< HEAD
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex items-center justify-center rounded-md text-body-sm text-white hover:bg-opacity-30 hover:text-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
            <BtnContextMenuIcon
              height={20}
              width={10}
              viewBox="0 0 1 20"
              className="text-secondary-700 hover:text-primary-400"
            />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <div className='flex gap-x-2 hover:text-primary-300'
              onClick={open}>
              <img
                src={btnEditIcon}
                alt="Edit DataBase"
                className="h-5 w-5"
              />
=======
      <Dropdown
        icon={
          <BtnContextMenuIcon
            height={20}
            width={10}
            viewBox="0 0 1 20"
            className="text-secondary-700 hover:text-primary-400"
          />
        }
      >
        <Menu.Items className="absolute right-0 z-10 mt-6 w-40 origin-top-right divide-y divide-secondary-400 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-1">
            <MenuItem
              icon={
                <img src={btnEditIcon} alt="Edit DataBase" className="size-5" />
              }
              onClick={open}
            >
>>>>>>> 5278f50b9b607578eae103be06d9fc2a6fc7ba5f
              {t('cloud:db_template.add_db.update_row')}
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ConfirmationDialog
              isDone={isSuccess}
              icon="danger"
              title={t('cloud:db_template.add_db.delete_row')}
              body={t('cloud:db_template.add_db.delete_row_confirm')}
              triggerButton={
                <Button
<<<<<<< HEAD
                  className="hover:text-primary-400 w-full justify-start p-0 border-none shadow-none"
=======
                  className="w-full justify-start border-none hover:text-primary-400"
>>>>>>> 5278f50b9b607578eae103be06d9fc2a6fc7ba5f
                  variant="trans"
                  size="square"
                  startIcon={
                    <img
                      src={btnDeleteIcon}
                      alt="Delete DataBase"
                      className="size-5"
                    />
                  }
                >
                  {t('cloud:db_template.add_db.delete_row')}
                </Button>
              }
              confirmButton={
                <Button
                  isLoading={isLoading}
                  type="button"
                  size="md"
                  className="bg-primary-400"
                  onClick={() => {
                    let keys = Object.keys(row)
                    const dataFilter = keys.map(item => ({
                      [item]: row[item],
                    }))
                    mutate({
                      table: tableName || '',
                      project_id: projectId,
                      data: {
                        filter: {
                          $and: dataFilter,
                        },
                      },
                    })
                  }}
                  startIcon={
                    <img src={btnSubmitIcon} alt="Submit" className="size-5" />
                  }
                />
              }
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {isOpen ? (
        <UpdateRow
          close={close}
          onClose={onClose}
          isOpen={isOpen}
          row={row}
          {...props}
        />
      ) : null}
    </>
  )
}

export function DataBaseTable({
  isShow,
  columnsProp,
  data,
  onClose,
  onSearch,
  ...props
}: {
  isShow: boolean
  columnsProp: string[]
  data: any[]
  onClose: () => void
  onSearch: (value: FieldsRows) => void
}) {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<FieldsRows>({})

  const handleSearch = (row: string, value: string) => {
    let result: FieldsRows = {}
    result[row] = value
    setFilter(pre => ({ ...pre, ...result }))
  }

  useEffect(() => {
    onSearch(filter)
  }, [filter])

  const columnHelper = createColumnHelper<any>()

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => info.row.index + 1,
        header: () => <span>{t('table:no')}</span>,
        footer: info => info.column.id,
      }),
      ...columnsProp?.map(item =>
        columnHelper.accessor(item, {
          header: () => (
            <div>
              <span className="text-table-header">{item}</span>
              {isShow && (
                <InputField
                  onClick={e => e.stopPropagation()}
                  onChange={e => handleSearch(item, e.target.value)}
                />
              )}
            </div>
          ),
          cell: info =>
            info.getValue() !== 'null'
              ? typeof info.getValue() === 'boolean'
                ? info.getValue()
                  ? 'true'
                  : 'false'
                : info.getValue()
              : '',
          footer: info => info.column.id,
        }),
      ),
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          return DataBaseTableContextMenu({
            row: info.row.original,
            onClose,
          })
        },
        header: () => null,
        footer: info => info.column.id,
      }),
    ],
    [columnsProp, isShow],
  )

  return (
    <BaseTable
      data={data ?? []}
      popoverClassName="absolute right-0 top-1 block"
      columns={columns}
      isHiddenCheckbox={true}
      {...props}
    />
  )
}
