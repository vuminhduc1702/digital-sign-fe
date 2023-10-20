import { Menu } from '@headlessui/react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Dropdown, MenuItem } from '~/components/Dropdown'
import { BaseTable } from '~/components/Table'
import { useDisclosure } from '~/utils/hooks'

import { type BaseTablePagination } from '~/types'

import btnEditIcon from '~/assets/icons/btn-edit.svg'
import { BtnContextMenuIcon } from '~/components/SVGIcons'
import { getVNDateFormat } from '~/utils/misc'
import { type Billing } from '../../types'
import { UpdateSubcription } from './UpdateSubcription'

function SubcriptionTableContextMenu({ id }: { id: string }) {
  const { t } = useTranslation()

  const { close, open, isOpen } = useDisclosure()
  const [type, setType] = useState('')

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
        <Menu.Items className="absolute right-0 z-10 mt-6 w-40 origin-top-right divide-y divide-secondary-400 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
              {t('billing:subcription.title')}
            </MenuItem>
          </div>
        </Menu.Items>
      </Dropdown>
      {isOpen ? (
        <UpdateSubcription id={id} close={close} isOpen={true} />
      ) : null}
    </>
  )
}

type BillingTableProps = {
  data?: Billing[]
} & BaseTablePagination

export function BillingTable({ data, ...props }: BillingTableProps) {
  const { t } = useTranslation()

  const columnHelper = createColumnHelper<Billing>()
  const columns = useMemo<ColumnDef<Billing, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => {
          const orderId = parseInt(info.row.id) + 1
          return orderId
        },
        header: () => <span>{t('table:no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('id', {
        header: () => (
          <span>{t('billing:subcription.popup.customer_code')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('c_name', {
        header: () => (
          <span>{t('billing:subcription.popup.customer_code')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('id', {
        header: () => (
          <span>{t('billing:subcription.popup.customer_code')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('id', {
        header: () => (
          <span>{t('billing:subcription.popup.customer_code')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      // columnHelper.accessor('s_status', {
      //   header: () => <span>{t('billing:subcription.table.status')}</span>,
      //   cell: info => {
      //     const { s_status } = info.row.original
      //     const valueStatus = () => {
      //       let result = ''
      //       if (s_status) {
      //         switch (s_status) {
      //           case 'Active':
      //             result = 'Hoạt động'
      //             break
      //           case 'Pending Cancel':
      //             result = 'Chờ hủy'
      //             break
      //           case 'Cancelled':
      //             result = 'Đã hủy'
      //             break
      //           case 'Pending Active':
      //             result = 'Chờ kích hoạt'
      //             break
      //           case 'Finished':
      //             result = 'Đã kết thúc'
      //             break
      //           default:
      //             break
      //         }
      //       }
      //       return result
      //     }
      //     return valueStatus()
      //   },
      //   footer: info => info.column.id,
      // }),
      // columnHelper.display({
      //   id: 'contextMenu',
      //   cell: info => {
      //     const { s_id } = info.row.original
      //     return SubcriptionTableContextMenu({
      //       id: s_id,
      //     })
      //   },
      //   header: () => null,
      //   footer: info => info.column.id,
      // }),
    ],
    [],
  )

  return data != null && data?.length !== 0 ? (
    <BaseTable data={data} columns={columns} {...props} />
  ) : (
    <div className="flex grow items-center justify-center">
      {t('table:no_subcription')}
    </div>
  )
}
