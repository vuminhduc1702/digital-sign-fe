import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { BaseTable } from '@/components/Table'
import { Input } from '@/components/ui/input'
import { useDisclosure } from '@/utils/hooks'
import storage from '@/utils/storage'
import { LuPen, LuTrash2 } from 'react-icons/lu'
import { useDeleteRow } from '../api/deleteRow'
import { type FieldsRows } from '../types'
import { UpdateRow } from './UpdateRow'

function DataBaseTableContextMenu({
  row,
  onClose,
  columnsType,
  ...props
}: {
  row: FieldsRows
  onClose: () => void
  columnsType: string[]
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
      <div className="flex">
        <div className="flex cursor-pointer justify-center p-3">
          <LuPen
            className="text-lg text-gray-500 transition-all duration-200 ease-in-out hover:scale-125 hover:text-black"
            onClick={open}
          />
        </div>
        <div className="flex cursor-pointer justify-center p-3">
          <LuTrash2
            className="text-lg text-gray-500 transition-all duration-200 ease-in-out hover:scale-125 hover:text-black"
            onClick={openDelete}
          />
        </div>
      </div>
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
    ],
    [columnsProp, isShow, data],
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
