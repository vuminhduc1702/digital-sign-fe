import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import btnEditIcon from '@/assets/icons/btn-edit.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { Button } from '@/components/ui/button'

import { BtnContextMenuIcon } from '@/components/SVGIcons'
import { BaseTable } from '@/components/Table'
import { useDisclosure } from '@/utils/hooks'
import storage from '@/utils/storage'
import { useDeleteRow } from '../api/deleteRow'
import { type FieldsRows } from '../types'
import { UpdateRow } from './UpdateRow'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Input } from '@/components/ui/input'

function DataBaseTableContextMenu({
  row,
  onClose,
  columnsType,
  ...props
}: {
  row: FieldsRows
  onClose: () => void
  columnsType?: string[]
}) {
  const { t } = useTranslation()

  const { close, open, isOpen } = useDisclosure()

  const {
    close: closeDelete,
    open: openDelete,
    isOpen: isOpenDelete,
  } = useDisclosure()
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
          <DropdownMenuItem onClick={open}>
            <img src={btnEditIcon} alt="Edit DataBase" className="h-5 w-5" />
            {t('cloud:db_template.add_db.update_row')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openDelete}>
            <img
              src={btnDeleteIcon}
              alt="Delete DataBase"
              className="h-5 w-5"
            />
            {t('cloud:db_template.add_db.delete_row')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UpdateRow
        close={close}
        onClose={onClose}
        isOpen={isOpen}
        row={row}
        columnsType={columnsType}
        {...props}
      />
      <ConfirmDialog
        icon="danger"
        title={t('cloud:db_template.add_db.delete_row')}
        body={t('cloud:db_template.add_db.delete_row_confirm')}
        close={closeDelete}
        isOpen={isOpenDelete}
        isSuccessDelete={isSuccess}
        handleSubmit={() => {
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
        isLoading={isLoading}
      />
    </>
  )
}

export function DataBaseTable({
  isShow,
  columnsProp,
  data,
  onClose,
  onSearch,
  columnsType,
  ...props
}: {
  isShow: boolean
  columnsProp: string[]
  data: any[]
  onClose: () => void
  onSearch: (value: FieldsRows) => void
  columnsType: string[]
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
                <Input
                  onClick={e => e.stopPropagation()}
                  onChange={e => handleSearch(item, e.target.value)}
                />
              )}
            </div>
          ),
          cell: info =>
            typeof info.getValue() === 'boolean'
              ? info.getValue()
                ? 'true'
                : 'false'
              : info.getValue(),
          footer: info => info.column.id,
        }),
      ),
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          return DataBaseTableContextMenu({
            row: info.row.original,
            onClose,
            columnsType,
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
