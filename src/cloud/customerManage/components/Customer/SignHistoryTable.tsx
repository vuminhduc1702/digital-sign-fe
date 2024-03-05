import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { BaseTable } from '~/components/Table'

import { type BaseTablePagination } from '~/types'

import { type Subcription } from '~/cloud/subcription'
import { getVNDateFormat } from '~/utils/misc'

type SignHistoryTableProps = {
  data?: Subcription[]
} & BaseTablePagination

export function SignHistoryTable({ data, ...props }: SignHistoryTableProps) {
  const { t } = useTranslation()

  const columnHelper = createColumnHelper<Subcription>()
  const columns = useMemo<ColumnDef<Subcription, any>[]>(
    () => [
      columnHelper.accessor('s_id', {
        header: () => <span>{t('billing:subcription.table.sub_code')}</span>,
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
    ],
    [],
  )

  return (
    <BaseTable
      data={data ?? []}
      columns={columns}
      onDataText={t('table:no_sign_history')}
      {...props}
    />
  )
}
