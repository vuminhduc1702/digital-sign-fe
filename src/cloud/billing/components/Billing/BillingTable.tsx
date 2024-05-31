import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BaseTable, type BaseTableProps } from '@/components/Table'
import { useDisclosure } from '@/utils/hooks'
import { getVNDateFormat } from '@/utils/misc'
import { DownloadIcon } from '@radix-ui/react-icons'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { LuEye } from 'react-icons/lu'
import { useBillingById } from '../../api/billingAPI'
import { type Billing } from '../../types'
import { BillingPDF } from './BillingPDF'
import { ViewBilling } from './ViewBilling'

function SubcriptionTableContextMenu({ id }: { id: string }) {
  const { t } = useTranslation()

  const { close, open, isOpen } = useDisclosure()
  const { data } = useBillingById({
    id,
  })

  return (
    <>
      <div className="flex">
        <div className="flex cursor-pointer justify-center p-3">
          <LuEye
            className="text-lg text-gray-500 transition-all duration-200 ease-in-out hover:scale-125 hover:text-black"
            onClick={open}
          />
        </div>
        <div className="flex cursor-pointer justify-center p-3">
          <PDFDownloadLink
            document={<BillingPDF dataPdf={data?.data} />}
            fileName={`Hóa đơn dịch vụ ${data?.data?.s_service_type}.pdf`}
          >
            <DownloadIcon className="text-lg text-gray-500 transition-all duration-200 ease-in-out hover:scale-125 hover:text-black" />
          </PDFDownloadLink>
        </div>
      </div>
      <ViewBilling id={id} close={close} isOpen={isOpen} />
    </>
  )
}

type PartialBaseTableProps<T> = Omit<BaseTableProps<Billing>, 'columns'> & {
  columns?: ColumnDef<T, any>[]
}

type BillingTableProps = {
  data?: Billing[]
  handleField?: (field: string, value: any) => void
  rowSelection: { [key: string]: boolean }
  setRowSelection: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >
} & PartialBaseTableProps<Billing>

export function BillingTable({
  data,
  handleField,
  ...props
}: BillingTableProps) {
  const { t } = useTranslation()

  const [plan, setPlan] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    setStatus('')
    setPlan('')
  }, [status, plan])

  const offsetPrev = useRef<number>(props.offset)

  useEffect(() => {
    if (props.isPreviousData && offsetPrev.current < props.offset) {
      offsetPrev.current = props.offset
    }
  }, [props.isPreviousData])

  const columnHelper = createColumnHelper<Billing>()
  const columns = useMemo<ColumnDef<Billing, any>[]>(
    () => [
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
      columnHelper.accessor('id', {
        header: () => <span>{t('billing:manage_bill.table.id')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('c_name', {
        header: () => <span>{t('billing:manage_bill.table.c_name')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('plan_name', {
        header: () => <span>{t('billing:manage_bill.table.plan_name')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('cost', {
        header: () => <span>{t('billing:manage_bill.table.cost')}</span>,
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('date_request', {
        header: () => (
          <span>{t('billing:manage_bill.table.date_request')}</span>
        ),
        cell: info =>
          info.getValue()
            ? getVNDateFormat({ date: parseInt(info.getValue()) * 1000 })
            : '',
        footer: info => info.column.id,
      }),
      columnHelper.accessor('date_expiry', {
        header: () => <span>{t('billing:manage_bill.table.date_expiry')}</span>,
        cell: info =>
          info.getValue()
            ? getVNDateFormat({ date: parseInt(info.getValue()) * 1000 })
            : '',
        footer: info => info.column.id,
      }),
      columnHelper.accessor('date_payment', {
        header: () => (
          <span>{t('billing:manage_bill.table.date_payment')}</span>
        ),
        cell: info =>
          info.getValue()
            ? getVNDateFormat({ date: parseInt(info.getValue()) * 1000 })
            : '',
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
      columnHelper.display({
        id: 'contextMenu',
        cell: info => {
          const { id } = info.row.original
          return SubcriptionTableContextMenu({
            id: id,
          })
        },
        header: () => null,
        footer: info => info.column.id,
      }),
    ],
    [plan, status, data, props.offset],
  )

  return (
    <BaseTable
      popoverClassName="absolute right-0 top-2 block"
      data={data ?? []}
      columns={columns}
      onDataText={t('table:no_bill')}
      {...props}
    />
  )
}
