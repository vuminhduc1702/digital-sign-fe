import { Menu } from '@headlessui/react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/Button'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Dropdown, MenuItem } from '~/components/Dropdown'
import { BaseTable } from '~/components/Table'
import { useDisclosure } from '~/utils/hooks'
import { useDeleteFirmWare } from '../../api/firmwareAPI'

import { type BaseTablePagination } from '~/types'

import { UploadIcon } from '@radix-ui/react-icons'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { BtnContextMenuIcon } from '~/components/SVGIcons'
import { getVNDateFormat } from '~/utils/misc'
import { type FirmWare } from '../../types'
import { UpdateFirmWare } from './UpdateFirmware'
import { UploadFileFirmWare } from './UploadFileFirmware'

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
  const [type, setType] = useState('')

  const { mutate, isLoading, isSuccess } = useDeleteFirmWare()

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
                <img src={btnEditIcon} alt="Edit device" className="h-5 w-5" />
              }
              onClick={() => {
                open()
                setType('create-firmware')
              }}
            >
              {t('cloud:firmware.add_firmware.edit_firmware')}
            </MenuItem>
            <MenuItem
              icon={<UploadIcon className="h-5 w-5" />}
              onClick={() => {
                open()
                setType('upload-firmware')
              }}
            >
              {t('cloud:firmware.add_firmware.upload_firmware')}
            </MenuItem>
            <ConfirmationDialog
              isDone={isSuccess}
              icon="danger"
              title={t('cloud:firmware.table.delete_firmware')}
              body={t('cloud:firmware.table.delete_firmware_confirm').replace(
                '{{FIRMWARE_NAME}}',
                name,
              )}
              triggerButton={
                <Button
                  className="hover:text-primary-400 w-full justify-start border-none"
                  variant="trans"
                  size="square"
                  startIcon={
                    <img
                      src={btnDeleteIcon}
                      alt="Delete thing"
                      className="h-5 w-5"
                    />
                  }
                >
                  {t('cloud:firmware.table.delete_firmware')}
                </Button>
              }
              confirmButton={
                <Button
                  isLoading={isLoading}
                  type="button"
                  size="md"
                  className="bg-primary-400"
                  onClick={() => mutate({ id })}
                  startIcon={
                    <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
                  }
                />
              }
            />
          </div>
        </Menu.Items>
      </Dropdown>
      {isOpen && type === 'create-firmware' ? (
        <UpdateFirmWare
          firmwareId={id}
          name={name}
          description={description}
          tag={tag}
          version={version}
          close={close}
          isOpen={true}
          template_name={template_name}
          template_id={template_id}
        />
      ) : null}
      {isOpen && type === 'upload-firmware' ? (
        <UploadFileFirmWare firmwareId={id} close={close} isOpen={true} />
      ) : null}
    </>
  )
}

type FirmWareTableProps = {
  data: FirmWare[]
} & BaseTablePagination

export function FirmWareTable({ data, ...props }: FirmWareTableProps) {
  const { t } = useTranslation()

  const columnHelper = createColumnHelper<FirmWare>()
  const columns = useMemo<ColumnDef<FirmWare, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => info.row.index + 1 + props.offset,
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
    ],
    [props.offset],
  )

  return (
    <BaseTable
      popoverClassName="absolute right-0 top-1 block"
      data={data}
      columns={columns}
      onDataText={t('table:no_firmware')}
      {...props}
    />
  )
}
