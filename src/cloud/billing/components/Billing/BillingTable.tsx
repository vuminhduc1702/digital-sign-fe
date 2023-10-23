import { Menu } from '@headlessui/react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Dropdown, MenuItem } from '~/components/Dropdown'
import { BaseTable } from '~/components/Table'
import { useDisclosure } from '~/utils/hooks'

import { type BaseTablePagination } from '~/types'

import { EyeOpenIcon, DownloadIcon } from '@radix-ui/react-icons'
import { BtnContextMenuIcon } from '~/components/SVGIcons'
import { getVNDateFormat } from '~/utils/misc'
import { type Billing } from '../../types'
import { ViewBilling } from './ViewBilling'
import { useBillingById } from '../../api/billingAPI'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { BillingPDF } from './BillingPDF'

function SubcriptionTableContextMenu({ id }: { id: string }) {
  const { t } = useTranslation()

  const { close, open, isOpen } = useDisclosure()
  const { data } = useBillingById({
    id,
    config: { suspense: false },
  })

  console.log(data, 'daataatatatt')

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
              icon={<EyeOpenIcon className="h-5 w-5" />}
              onClick={() => {
                open()
              }}
            >
              {t('billing:manage_bill.preview_bill')}
            </MenuItem>
            <PDFDownloadLink
              document={<BillingPDF dataPdf={data?.data} />}
              fileName={`Hóa đơn dịch vụ ${data?.data?.s_service_type}.pdf`}
            >
              <MenuItem
                icon={<DownloadIcon className="h-5 w-5" />}
                onClick={() => { }}
              >
                {t('billing:manage_bill.export_PDF')}
              </MenuItem>
            </PDFDownloadLink>
          </div>
        </Menu.Items>
      </Dropdown>
      {isOpen ? <ViewBilling id={id} close={close} isOpen={true} /> : null}
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
    [],
  )

  return data != null && data?.length !== 0 ? (
    <BaseTable data={data} columns={columns} {...props} />
  ) : (
    <div className="flex grow items-center justify-center">
      {t('table:no_bill')}
    </div>
  )
}
