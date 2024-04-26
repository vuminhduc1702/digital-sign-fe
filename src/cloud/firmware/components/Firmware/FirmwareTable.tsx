import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo, useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/Button'

import { BaseTable, type BaseTableProps } from '@/components/Table'
import { useCopyId, useDisclosure } from '@/utils/hooks'
import { useDeleteFirmWare } from '../../api/firmwareAPI'

import { type BaseTablePagination } from '@/types'

import { UploadIcon } from '@radix-ui/react-icons'
import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import btnEditIcon from '@/assets/icons/btn-edit.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { BtnContextMenuIcon } from '@/components/SVGIcons'
import { getVNDateFormat } from '@/utils/misc'
import { type FirmWare } from '../../types'
import { UpdateFirmWare } from './UpdateFirmware'
import { UploadFileFirmWare } from './UploadFileFirmware'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/Dropdowns'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { LuEye, LuPen, LuTrash2, LuMoreVertical, LuFiles } from 'react-icons/lu'

function FireWareTableContextMenu({
  id,
  name,
  description,
  tag,
  version,
  template_name,
  template_id,
}: {
  id: string
  name: string
  description: string
  tag: string
  version: string
  template_name: string
  template_id: string
}) {
  const { t } = useTranslation()

  const { close, open, isOpen } = useDisclosure()
  const {
    close: closeDelete,
    open: openDelete,
    isOpen: isOpenDelete,
  } = useDisclosure()

  const {
    close: closeUpload,
    open: openUpload,
    isOpen: isOpenUpload,
  } = useDisclosure()

  const { mutate, isLoading, isSuccess } = useDeleteFirmWare()

  const handleCopyId = useCopyId()
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
          <LuFiles
            className="text-lg text-gray-500 transition-all duration-200 ease-in-out hover:scale-125 hover:text-black"
            onClick={() => handleCopyId(id)}
          />
        </div>
        <div className="flex cursor-pointer justify-center p-3">
          <LuTrash2
            className="text-lg text-gray-500 transition-all duration-200 ease-in-out hover:scale-125 hover:text-black"
            onClick={openDelete}
          />
        </div>
        {/* <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex cursor-pointer justify-center p-3">
              <LuMoreVertical 
            className="text-lg text-gray-500 hover:text-black hover:scale-125 transition-all duration-200 ease-in-out"
             />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={open}>
              <img src={btnEditIcon} alt="Edit device" className="h-5 w-5" />
              {t('cloud:firmware.add_firmware.edit_firmware')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openUpload}>
              <UploadIcon className="h-5 w-5" />
              {t('cloud:firmware.add_firmware.upload_firmware')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openDelete}>
              <img
                src={btnDeleteIcon}
                alt="Delete firmware"
                className="h-5 w-5"
              />
              {t('cloud:firmware.table.delete_firmware')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>
      {isOpen ? (
        <UpdateFirmWare
          firmwareId={id}
          name={name}
          description={description}
          tag={tag}
          version={version}
          close={close}
          isOpen={isOpen}
          template_name={template_name}
          template_id={template_id}
        />
      ) : null}
      {isOpenUpload ? (
        <UploadFileFirmWare
          firmwareId={id}
          close={closeUpload}
          isOpen={isOpenUpload}
        />
      ) : null}

      {isOpenDelete ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:firmware.table.delete_firmware')}
          body={t('cloud:firmware.table.delete_firmware_confirm').replace(
            '{{FIRMWARE_NAME}}',
            name,
          )}
          close={closeDelete}
          isOpen={isOpenDelete}
          handleSubmit={() => mutate({ id })}
          isLoading={isLoading}
        />
      ) : null}
    </>
  )
}

type PartialBaseTableProps<T> = Omit<BaseTableProps<FirmWare>, 'columns'> & {
  columns?: ColumnDef<T, any>[]
}

type FirmWareTableProps = {
  data: FirmWare[]
  rowSelection: { [key: string]: boolean }
  setRowSelection: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >
} & PartialBaseTableProps<FirmWare>

export function FirmWareTable({ data, ...props }: FirmWareTableProps) {
  const { t } = useTranslation()

  const offsetPrev = useRef<number>(props.offset)

  useEffect(() => {
    if (props.isPreviousData && offsetPrev.current < props.offset) {
      offsetPrev.current = props.offset
    }
  }, [props.isPreviousData])

  const columnHelper = createColumnHelper<FirmWare>()
  const columns = useMemo<ColumnDef<FirmWare, any>[]>(
    () => [
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          const {
            name,
            id,
            description,
            tag,
            version,
            template_name,
            template_id,
          } = info.row.original
          return FireWareTableContextMenu({
            name,
            id,
            description,
            version,
            tag,
            template_name,
            template_id,
          })
        },
        header: () => null,
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'stt',
        cell: info => {
          return !props.isPreviousData
            ? info.row.index + 1 + props.offset
            : info.row.index + 1 + offsetPrev.current
        },
        header: () => <span>{t('table:no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('template_name', {
        header: () => <span>{t('cloud:firmware.table.template')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('name', {
        header: () => <span>{t('cloud:firmware.table.name')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('tag', {
        header: () => <span>{t('cloud:firmware.table.tag')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('version', {
        header: () => <span>{t('cloud:firmware.table.version')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('created_time', {
        header: () => <span>{t('cloud:firmware.table.create_time')}</span>,
        cell: info =>
          getVNDateFormat({ date: parseInt(info.getValue()) * 1000 }),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('email', {
        header: () => <span>{t('cloud:firmware.table.created_by')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('description', {
        header: () => <span>{t('cloud:firmware.table.description')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
    ],
    [props.offset],
  )

  return (
    <BaseTable
      popoverClassName="absolute right-0 top-1 block"
      data={data || []}
      columns={columns}
      onDataText={t('table:no_firmware')}
      {...props}
    />
  )
}
