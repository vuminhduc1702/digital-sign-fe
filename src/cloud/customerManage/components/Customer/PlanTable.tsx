import {
  createColumnHelper,
  type ColumnDef,
  type Row,
} from '@tanstack/react-table'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { BaseTable } from '@/components/Table'

import { type BaseTablePagination } from '@/types'

import { type Subcription } from '@/cloud/subcription'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { getVNDateFormat } from '@/utils/misc'
import { useForm } from 'react-hook-form'
import { LuChevronDown, LuChevronRight } from 'react-icons/lu'

type CustomerTableProps = {
  data?: Subcription[]
} & BaseTablePagination

export function PlanTable({ data, ...props }: CustomerTableProps) {
  const { t } = useTranslation()

  const form = useForm({
    values: {
      p_name: '',
      s_date_register: '',
      end_date: '',
      payment_type: '',
      quantity_purchased: '',
      used: '',
      result: '',
    },
  })

  const renderSubComponent = ({ row }: { row: Row<Subcription> }) => {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-3">
            <p className="text-table-header">
              {t('billing:customer_manage.plan_detail.title')}
            </p>
          </div>
        </div>
        <Form {...form}>
          <form className="w-full space-y-5" onSubmit={e => e.preventDefault()}>
            <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="p_name"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>
                      {t('billing:customer_manage.plan_detail.name')}
                    </FormLabel>
                    <div>
                      <FormControl>
                        <Input value={row.original?.p_name ?? ''} disabled />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="s_date_register"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>
                      {t('billing:customer_manage.plan_detail.start_date')}
                    </FormLabel>
                    <div>
                      <FormControl>
                        <Input
                          value={
                            row.original?.s_date_register
                              ? getVNDateFormat({
                                  date: row.original?.s_date_register * 1000,
                                })
                              : ''
                          }
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>
                      {t('billing:customer_manage.plan_detail.end_date')}
                    </FormLabel>
                    <div>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payment_type"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>
                      {t('billing:customer_manage.plan_detail.payment_type')}
                    </FormLabel>
                    <div>
                      <FormControl>
                        <Input
                          value={
                            row.original?.p_payment_type
                              ? row.original?.p_payment_type === 'PREPAY'
                                ? 'Trả trước'
                                : 'Trả sau'
                              : ''
                          }
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity_purchased"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>
                      {t(
                        'billing:customer_manage.plan_detail.quantity_purchased',
                      )}
                    </FormLabel>
                    <div>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="used"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>
                      {t('billing:customer_manage.plan_detail.used')}
                    </FormLabel>
                    <div>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="result"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>
                      {t('billing:customer_manage.plan_detail.result')}
                    </FormLabel>
                    <div>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </div>
    )
  }

  const columnHelper = createColumnHelper<Subcription>()
  const columns = useMemo<ColumnDef<Subcription, any>[]>(
    () => [
      columnHelper.display({
        id: 'contextMenu',
        header: () => null,
        cell: ({ row }) => {
          return (
            <button
              {...{
                onClick: row.getToggleExpandedHandler(),
                style: { cursor: 'pointer' },
              }}
            >
              {row.getIsExpanded() ? (
                <LuChevronDown className="h-5 w-5" />
              ) : (
                <LuChevronRight className="h-5 w-5" />
              )}
            </button>
          )
        },
      }),
      columnHelper.display({
        id: 'stt',
        cell: info => info.row.index + 1,
        header: () => <span>{t('table:no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('s_id', {
        header: () => (
          <span>{t('billing:customer_manage.table_plan.sub_id')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('p_id', {
        header: () => (
          <span>{t('billing:customer_manage.table_plan.plan_id')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('p_name', {
        header: () => (
          <span>{t('billing:customer_manage.table_plan.plan_name')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
      columnHelper.accessor('p_price', {
        header: () => (
          <span>{t('billing:customer_manage.table_plan.cost')}</span>
        ),
        cell: info => info.getValue(),
        footer: info => info.column.id,
      }),
    ],
    [],
  )

  return (
    <BaseTable
      getRowCanExpand={() => true}
      renderSubComponent={renderSubComponent}
      data={data ?? []}
      columns={columns}
      onDataText={t('table:no_plan_used')}
      {...props}
    />
  )
}
