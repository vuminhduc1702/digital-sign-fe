import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { BaseTable } from '~/components/Table'

import { type BaseTablePagination } from '~/types'

import { type Billing } from '~/cloud/billing'
import { getVNDateFormat } from '~/utils/misc'

type PaymentHistoryTableProps = {
  data?: Billing[]
} & BaseTablePagination

export function PaymentHistoryTable({
  data,
  ...props
}: PaymentHistoryTableProps) {
  const { t } = useTranslation()

  const columnHelper = createColumnHelper<Billing>()
  const columns = useMemo<ColumnDef<Billing, any>[]>(
    () => [
      columnHelper.accessor('plan_name', {
        header: () => <span>{t('billing:manage_bill.table.plan_name')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('date_request', {
        header: () => <span>{t('billing:manage_bill.table.date_start')}</span>,
        cell: info =>
          info.getValue()
            ? getVNDateFormat({ date: parseInt(info.getValue()) * 1000 })
            : '',
        footer: info => info.column.id,
      }),
      columnHelper.accessor('date_expiry', {
        header: () => <span>{t('billing:manage_bill.table.date_end')}</span>,
        cell: info =>
          info.getValue()
            ? getVNDateFormat({ date: parseInt(info.getValue()) * 1000 })
            : '',
        footer: info => info.column.id,
      }),
      columnHelper.accessor('cost', {
        header: () => <span>{t('billing:manage_bill.table.cost')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('id', {
        header: () => <span>{t('billing:manage_bill.table.id')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('status', {
        header: () => <span>{t('billing:manage_bill.table.status')}</span>,
        cell: info => {
          const { status } = info.row.original
          const valueStatus = () => {
            let result = ''
            if (status) {
              switch (status) {
                case 'Wait':
                  result = 'Đang chờ thanh toán'
                  break
                case 'Paid':
                  result = 'Đã thanh toán'
                  break
                case 'Expired':
                  result = 'Hết hạn thanh toán'
                  break
                case 'Init':
                  result = 'Khởi tạo'
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
      onDataText={t('table:no_payment_history')}
      {...props}
    />
  )
}
