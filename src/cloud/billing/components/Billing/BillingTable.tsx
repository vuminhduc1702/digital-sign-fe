import { Menu } from '@headlessui/react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Dropdown, MenuItem } from '~/components/Dropdown'
import { BaseTable } from '~/components/Table'
import { useDisclosure } from '~/utils/hooks'

import { type BaseTablePagination } from '~/types'

import { DownloadIcon, EyeOpenIcon } from '@radix-ui/react-icons'
import { PDFDownloadLink } from '@react-pdf/renderer'
import btnFilterIcon from '~/assets/icons/btn-filter.svg'
import { Button } from '~/components/Button'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/Popover'
import { BtnContextMenuIcon } from '~/components/SVGIcons'
import { cn, getVNDateFormat } from '~/utils/misc'
import { useBillingById } from '../../api/billingAPI'
import { type Billing } from '../../types'
import { BillingPDF } from './BillingPDF'
import { ViewBilling } from './ViewBilling'

function SubcriptionTableContextMenu({ id }: { id: string }) {
  const { t } = useTranslation()

  const { close, open, isOpen } = useDisclosure()
  const { data } = useBillingById({
    id,
    config: { suspense: false },
  })

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
                onClick={() => {}}
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
  handleField?: (field: string, value: any) => void
} & BaseTablePagination

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

  const planArr = data?.filter((obj, index) => {
    return index === data.findIndex(o => obj.plan_name === o.plan_name)
  })

  const statusArr = data?.filter((obj, index) => {
    return index === data.findIndex(o => obj.status === o.status)
  })

  const handleSearch = (
    e: React.MouseEvent<HTMLInputElement>,
    field: string,
    value: any,
    id: string,
  ) => {
    e.stopPropagation()
    setPlan(id)
    setStatus(id)
    if (!id) {
      handleField?.('', '')
    } else {
      handleField?.(field, value)
    }
  }

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
        header: () => (
          <>
            <span>{t('billing:manage_bill.table.plan_name')}</span>
            <Popover>
              <PopoverTrigger onClick={e => e.stopPropagation()} asChild>
                <Button
                  className="border-none shadow-none"
                  variant="trans"
                  size="square"
                  startIcon={
                    <img src={btnFilterIcon} alt="" className="h-5 w-5" />
                  }
                />
              </PopoverTrigger>
              <PopoverContent className="w-40" align="start">
                <div
                  className={cn('cursor-pointer p-2 hover:bg-red-300')}
                  onClick={(e: React.MouseEvent<HTMLInputElement>) =>
                    handleSearch(e, 'plan_id', '', '')
                  }
                >
                  All
                </div>
                {planArr?.map(item => {
                  return (
                    <div
                      key={item.id}
                      className={cn('cursor-pointer p-2 hover:bg-red-300')}
                      onClick={(e: React.MouseEvent<HTMLInputElement>) =>
                        handleSearch(e, 'plan_id', item.plan_id, item.id)
                      }
                    >
                      {item.plan_name}
                    </div>
                  )
                })}
              </PopoverContent>
            </Popover>
          </>
        ),
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
        header: () => (
          <>
            <span>{t('billing:manage_bill.table.status')}</span>
            <Popover>
              <PopoverTrigger onClick={e => e.stopPropagation()} asChild>
                <Button
                  className="border-none shadow-none"
                  variant="trans"
                  size="square"
                  startIcon={
                    <img src={btnFilterIcon} alt="" className="h-5 w-5" />
                  }
                />
              </PopoverTrigger>
              <PopoverContent className="w-40" align="start">
                <div
                  className={cn('cursor-pointer p-2 hover:bg-red-300')}
                  onClick={(e: React.MouseEvent<HTMLInputElement>) =>
                    handleSearch(e, 'status', '', '')
                  }
                >
                  All
                </div>
                {statusArr?.map(item => {
                  const valueStatus = () => {
                    let result = ''
                    if (item.status) {
                      switch (item.status) {
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
                  return (
                    <div
                      key={item.id}
                      className={cn('cursor-pointer p-2 hover:bg-red-300')}
                      onClick={(e: React.MouseEvent<HTMLInputElement>) =>
                        handleSearch(e, 'status', item.status, item.id)
                      }
                    >
                      {valueStatus()}
                    </div>
                  )
                })}
              </PopoverContent>
            </Popover>
          </>
        ),
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
    [plan, status, data],
  )

  return (
    <BaseTable
      popoverClassName="absolute right-0 top-2 block"
      data={data || []}
      columns={columns}
      onDataText={t('table:no_bill')}
      {...props}
    />
  )
}
