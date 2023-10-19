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
import { type Subcription } from '../../types'
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

type SubcriptionTableProps = {
  data?: Subcription[]
} & BaseTablePagination

export function SubcriptionTable({ data, ...props }: SubcriptionTableProps) {
  const { t } = useTranslation()

  const columnHelper = createColumnHelper<Subcription>()
  const columns = useMemo<ColumnDef<Subcription, any>[]>(
    () => [
      columnHelper.accessor('s_id', {
        header: () => <span>{t('billing:subcription.table.sub_code')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('c_customer_code', {
        header: () => (
          <span>{t('billing:subcription.popup.customer_code')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('c_name', {
        header: () => (
          <span>{t('billing:subcription.popup.customer_name')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('p_name', {
        header: () => <span>{t('billing:subcription.popup.package')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('p_period', {
        header: () => <span>{t('billing:subcription.popup.period')}</span>,
        cell: info => {
          const { p_cal_unit, p_period } = info.row.original
          const valuePeriod = () => {
            let result = ''
            if (p_cal_unit) {
              switch (p_cal_unit) {
                case 'day':
                  result = ' ngày'
                  break
                case 'week':
                  result = ' tuần'
                  break
                case 'month':
                  result = ' tháng'
                  break
                case 'year':
                  result = ' năm'
                  break
                default:
                  break
              }
            }
            return p_period ? p_period + result : ''
          }
          return valuePeriod()
        },
        footer: info => info.column.id,
      }),
      columnHelper.accessor('p_estimate', {
        header: () => (
          <span>{t('billing:subcription.popup.price_method')}</span>
        ),
        cell: info => {
          const { p_estimate } = info.row.original
          const valuePriceMethod = () => {
            let result = ''
            if (p_estimate) {
              switch (p_estimate) {
                case 'mass':
                  result = 'Theo khối lượng'
                  break
                case 'fix':
                  result = 'Cố định'
                  break
                case 'unit':
                  result = 'Theo đơn vị'
                  break
                case 'accumulated':
                  result = 'Theo lũy kế'
                  break
                case 'step':
                  result = 'Theo bậc thang'
                  break
                default:
                  break
              }
            }
            return result || ''
          }
          return valuePriceMethod()
        },
        footer: info => info.column.id,
      }),
      columnHelper.accessor('s_date_register', {
        header: () => <span>{t('billing:subcription.table.start_date')}</span>,
        cell: info =>
          getVNDateFormat({ date: parseInt(info.getValue()) * 1000 }),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('s_cycle_now', {
        header: () => <span>{t('billing:subcription.table.cycle_now')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('s_status', {
        header: () => <span>{t('billing:subcription.table.status')}</span>,
        cell: info => {
          const { s_status } = info.row.original
          const valueStatus = () => {
            let result = ''
            if (s_status) {
              switch (s_status) {
                case 'Active':
                  result = 'Hoạt động'
                  break
                case 'Pending Cancel':
                  result = 'Chờ hủy'
                  break
                case 'Cancelled':
                  result = 'Đã hủy'
                  break
                case 'Pending Active':
                  result = 'Chờ kích hoạt'
                  break
                case 'Finished':
                  result = 'Đã kết thúc'
                  break
                default:
                  break
              }
            }
            return result
          }
          return valueStatus()
        },
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          const { s_id } = info.row.original
          return SubcriptionTableContextMenu({
            id: s_id,
          })
        },
        header: () => null,
        footer: info => info.column.id,
      }),
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
