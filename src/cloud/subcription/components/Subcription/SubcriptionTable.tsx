import { Menu } from '@headlessui/react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Dropdown, MenuItem } from '~/components/Dropdown'
import { BaseTable } from '~/components/Table'
import { useDisclosure } from '~/utils/hooks'

import { type BaseTablePagination } from '~/types'

import btnEditIcon from '~/assets/icons/btn-edit.svg'
import { BtnContextMenuIcon } from '~/components/SVGIcons'
import { cn, getVNDateFormat } from '~/utils/misc'
import { type Subcription } from '../../types'
import { UpdateSubcription } from './UpdateSubcription'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/Popover'
import { Button } from '~/components/Button'
import btnFilterIcon from '~/assets/icons/btn-filter.svg'

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
                <img src={btnEditIcon} alt="Edit device" className="size-5" />
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
  handleField?: (field: string, value: any) => void
  rowSelection: { [key: string]: boolean }
  setRowSelection: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >
} & BaseTablePagination

export function SubcriptionTable({
  data,
  handleField,
  ...props
}: SubcriptionTableProps) {
  const { t } = useTranslation()

  const [plan, setPlan] = useState('')
  const [estimate, setEstimate] = useState('')
  const [calUnit, setCalUnit] = useState('')

  useEffect(() => {
    setEstimate('')
    setPlan('')
    setCalUnit('')
  }, [estimate, plan, calUnit])

  const planArr = data?.filter((obj, index) => {
    return index === data.findIndex(o => obj.p_name === o.p_name)
  })

  const estimateArr = data?.filter((obj, index) => {
    return index === data.findIndex(o => obj.p_estimate === o.p_estimate)
  })

  const calUnitArr = data?.filter((obj, index) => {
    return index === data.findIndex(o => obj.p_cal_unit === o.p_cal_unit)
  })

  const handleSearch = (
    e: React.MouseEvent<HTMLInputElement>,
    field: string,
    value: any,
    id: string,
  ) => {
    e.stopPropagation()
    setPlan(id)
    setEstimate(id)
    setCalUnit('')
    if (!id) {
      handleField?.('', '')
    } else {
      handleField?.(field, value)
    }
  }

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
        header: () => (
          <>
            <span>{t('billing:subcription.popup.package')}</span>{' '}
            <Popover>
              <PopoverTrigger onClick={e => e.stopPropagation()} asChild>
                <Button
                  className="border-none shadow-none"
                  variant="trans"
                  size="square"
                  startIcon={
                    <img src={btnFilterIcon} alt="" className="size-5" />
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
                      key={item.p_id}
                      className={cn('cursor-pointer p-2 hover:bg-red-300')}
                      onClick={(e: React.MouseEvent<HTMLInputElement>) =>
                        handleSearch(e, 'plan_id', item.p_id, item.p_id)
                      }
                    >
                      {item.p_name}
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
      columnHelper.accessor('p_period', {
        header: () => (
          <>
            <span>{t('billing:subcription.popup.period')}</span>
            <Popover>
              <PopoverTrigger onClick={e => e.stopPropagation()} asChild>
                <Button
                  className="border-none shadow-none"
                  variant="trans"
                  size="square"
                  startIcon={
                    <img src={btnFilterIcon} alt="" className="size-5" />
                  }
                />
              </PopoverTrigger>
              <PopoverContent className="w-40" align="start">
                <div
                  className={cn('cursor-pointer p-2 hover:bg-red-300')}
                  onClick={(e: React.MouseEvent<HTMLInputElement>) =>
                    handleSearch(e, 'cal_unit', '', '')
                  }
                >
                  All
                </div>
                {calUnitArr?.map(item => {
                  const valuePeriod = () => {
                    let result = ''
                    if (item.p_cal_unit) {
                      switch (item.p_cal_unit) {
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
                    return result
                  }
                  return (
                    <div
                      key={item.s_id}
                      className={cn('cursor-pointer p-2 hover:bg-red-300')}
                      onClick={(e: React.MouseEvent<HTMLInputElement>) =>
                        handleSearch(
                          e,
                          'cal_unit',
                          item.p_cal_unit,
                          item.p_cal_unit,
                        )
                      }
                    >
                      {valuePeriod()}
                    </div>
                  )
                })}
              </PopoverContent>
            </Popover>
          </>
        ),
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
          <>
            <span>{t('billing:subcription.popup.price_method')}</span>
            <Popover>
              <PopoverTrigger onClick={e => e.stopPropagation()} asChild>
                <Button
                  className="border-none shadow-none"
                  variant="trans"
                  size="square"
                  startIcon={
                    <img src={btnFilterIcon} alt="" className="size-5" />
                  }
                />
              </PopoverTrigger>
              <PopoverContent className="w-40" align="start">
                <div
                  className={cn('cursor-pointer p-2 hover:bg-red-300')}
                  onClick={(e: React.MouseEvent<HTMLInputElement>) =>
                    handleSearch(e, 'estimate', '', '')
                  }
                >
                  All
                </div>
                {estimateArr?.map(item => {
                  const valuePriceMethod = () => {
                    let result = ''
                    if (item.p_estimate) {
                      switch (item.p_estimate) {
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
                  return (
                    <div
                      key={item.s_id}
                      className={cn('cursor-pointer p-2 hover:bg-red-300')}
                      onClick={(e: React.MouseEvent<HTMLInputElement>) =>
                        handleSearch(
                          e,
                          'estimate',
                          item.p_estimate,
                          item.p_estimate,
                        )
                      }
                    >
                      {valuePriceMethod()}
                    </div>
                  )
                })}
              </PopoverContent>
            </Popover>
          </>
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
    [plan, estimate, calUnit, data],
  )

  return (
    <BaseTable
      data={data ?? []}
      columns={columns}
      onDataText={t('table:no_subscription')}
      {...props}
    />
  )
}
