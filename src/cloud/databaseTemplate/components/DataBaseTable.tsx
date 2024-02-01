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

function DataBaseTableContextMenu({ row, onClose, ...props }: { row: FieldsRows, onClose: () => void }) {
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
        <Menu.Items className="divide-secondary-400 absolute right-0 z-10 mt-6 w-40 origin-top-right divide-y rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-1">
            <MenuItem
              icon={
                <img
                  src={btnEditIcon}
                  alt="Edit DataBase"
                  className="h-5 w-5"
                />
              }
              onClick={open}
            >
              {t('cloud:db_template.add_db.update_row')}
            </MenuItem>
            <ConfirmationDialog
              isDone={isSuccess}
              icon="danger"
              title={t('cloud:db_template.add_db.delete_row')}
              body={t('cloud:db_template.add_db.delete_row_confirm')}
              triggerButton={
                <Button
                  className="hover:text-primary-400 w-full justify-start border-none"
                  variant="trans"
                  size="square"
                  startIcon={
                    <img
                      src={btnDeleteIcon}
                      alt="Delete DataBase"
                      className="h-5 w-5"
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
                          "$and": dataFilter
                        },
                      },
                    })
                  }
                  }
                  startIcon={
                    <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
                  }
                />
              }
            />
          </div>
        </Menu.Items>
      </Dropdown>
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
      ...columnsProp?.map(item =>
        columnHelper.accessor(item, {
          header: () =>
            <div>
              <span>{item}</span>
              {isShow &&
                <InputField
                  onClick={e => e.stopPropagation()}
                  onChange={e => handleSearch(item, e.target.value)}
                />
              }
            </div>,
          cell: info => info?.getValue(),
          footer: info => info.column.id,
        }),
      ),
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          return DataBaseTableContextMenu({
            row: info.row.original,
            onClose
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
      popoverClassName="absolute right-0 top-1 block"
      data={data || []}
      columns={columns}
      {...props}
    />
  )
}