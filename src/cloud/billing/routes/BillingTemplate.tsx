import { useMemo, useRef, useState } from 'react'

import storage from '@/utils/storage'
import { HiOutlineXMark } from 'react-icons/hi2'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { type DateRange } from 'react-day-picker'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { searchSubcriptionSchema } from '@/cloud/subcription/routes/SubcriptionTemplate'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { InputField, SelectDropdown } from '@/components/Form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { SearchIcon } from '@/components/SVGIcons'
import { cn } from '@/utils/misc'
import { useGetBillings } from '../api/billingAPI'
import { BillingTable } from '../components/Billing'
import { ExportTable } from '@/components/Table/components/ExportTable'
import { convertEpochToDate } from '@/utils/transformFunc'
import { SearchField } from '@/components/Input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const transformStatus = (stt: string) => {
  switch (stt) {
    case 'Wait':
      return 'Đang chờ thanh toán'
    case 'Paid':
      return 'Đã thanh toán'
    case 'Expired':
      return 'Hết hạn thanh toán'
    case 'Init':
      return 'Khởi tạo'
    default:
      return ''
  }
}

export function BillingTemplate() {
  const { t } = useTranslation()
  const [offset, setOffset] = useState<number>(0)
  const [searchFilter, setSearchFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [startTime, setStartTime] = useState<number | undefined>()
  const [endTime, setEndTime] = useState<number | undefined>()
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })
  const searchField = useRef('')
  const projectId = storage.getProject()?.id
  const { data, isPreviousData, isLoading } = useGetBillings({
    projectId,
    searchFilter: searchField.current,
    searchData: searchQuery,
    // config: { staleTime: 1000 },
    // start_time: date?.from && date?.from?.getTime() / 1000,
    // end_time: date?.to && date?.to?.getTime() / 1000,
  })

  const form = useForm({
    resolver: searchSubcriptionSchema && zodResolver(searchSubcriptionSchema),
    defaultValues: { value: '', key: '' },
  })

  const { register, formState, control, handleSubmit } = form

  const [rowSelection, setRowSelection] = useState({})
  const pdfHeader = useMemo(
    () => [
      t('table:no'),
      t('billing:manage_bill.table.id'),
      t('billing:manage_bill.table.c_name'),
      t('billing:manage_bill.table.plan_name'),
      t('billing:manage_bill.table.cost'),
      t('billing:manage_bill.table.date_request'),
      t('billing:manage_bill.table.date_expiry'),
      t('billing:manage_bill.table.date_payment'),
      t('billing:manage_bill.table.status'),
    ],
    [],
  )
  const rowSelectionKey = Object.keys(rowSelection)
  const formatExcel: Array<{ [key: string]: unknown }> | undefined =
    data?.data?.data?.reduce(
      (acc, curr, index) => {
        if (rowSelectionKey.includes(curr.id)) {
          const temp = {
            [t('table:no')]: (index + 1).toString(),
            [t('billing:manage_bill.table.id')]: curr.id,
            [t('billing:manage_bill.table.c_name')]: curr.c_name,
            [t('billing:manage_bill.table.plan_name')]: curr.plan_name,
            [t('billing:manage_bill.table.cost')]: curr.cost,
            [t('billing:manage_bill.table.date_request')]: convertEpochToDate(
              curr.date_request,
            ),
            [t('billing:manage_bill.table.date_expiry')]: convertEpochToDate(
              curr.date_expiry,
            ),
            [t('billing:manage_bill.table.date_payment')]: convertEpochToDate(
              curr.date_payment,
            ),
            [t('billing:manage_bill.table.status')]: transformStatus(
              curr.status,
            ),
          }
          acc.push(temp)
        }
        return acc
      },
      [] as Array<{ [key: string]: unknown }>,
    )

  return (
    <>
      {/* <TitleBar title={t('sidebar:payment.plhd')} /> */}
      <div className="relative flex grow flex-col rounded-md bg-gray-50 px-9 py-3 shadow-lg">
        <div className="mb-5 flex justify-between">
          <div className="flex flex-col justify-between space-y-6">
            <div className="flex items-center gap-x-3">
              <SearchField
                setSearchValue={setSearchQuery}
                searchField={searchField}
                fieldOptions={[
                  // {
                  //   label: t('search:all'),
                  //   value: 'id, customer_name, plan_name',
                  // },
                  { label: t('schema:bill'), value: 'id' },
                  { label: t('schema:customer_name'), value: 'customer_name' },
                  {
                    label: t('billing:manage_bill.table.plan_name'),
                    value: 'plan_name',
                  },
                ]}
                // date={date}
                // setDate={setDate}
                closeSearch={true}
              />
            </div>
          </div>
          {/* <Form {...form}>
            <form
              id="search-subcription"
              className="flex flex-col justify-between space-y-6"
              onSubmit={handleSubmit(values => {
                const newObj = {}
                newObj[values.key] = values.value
                setStartTime(
                  date?.from?.getTime() && date?.from?.getTime() / 1000,
                )
                setEndTime(date?.to?.getTime() && date?.to?.getTime() / 1000)
                setSearchFilter(newObj)
              })}
            >
              <div className="flex gap-x-3">
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem className="h-[38px] min-w-[250px]">
                      <FormControl>
                        <Select
                          {...field}
                          onValueChange={onChange}
                          value={value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t('placeholder:select')}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[
                              { label: t('schema:bill'), value: 'id' },
                              {
                                label: t('schema:customer_name'),
                                value: 'customer_name',
                              },
                            ].map(option => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem className="h-[38px] min-w-[250px]">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className={cn('grid gap-2')}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant="trans"
                        className={cn(
                          'h-[36px] w-[300px] justify-start rounded-md text-left font-normal ',
                          !date && 'text-muted-foreground',
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, 'dd MM, y')} -{' '}
                              {format(date.to, 'dd MM, y')}
                            </>
                          ) : (
                            format(date.from, 'dd MM, y')
                          )
                        ) : (
                          <span>
                            {t('cloud:dashboard.config_chart.pick_date')}
                          </span>
                        )}
                        {date?.from && (
                          <HiOutlineXMark
                            onClick={() =>
                              setDate({
                                from: undefined,
                                to: undefined,
                              })
                            }
                            className="absolute right-3 top-2.5 h-4 w-4 "
                          />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  className="rounded-md"
                  variant="trans"
                  size="square"
                  startIcon={
                    <SearchIcon width={16} height={16} viewBox="0 0 16 16" />
                  }
                  form="search-subcription"
                  type="submit"
                />
              </div>
            </form>
          </Form> */}
        </div>
        <BillingTable
          data={data?.data?.data || []}
          offset={offset}
          setOffset={setOffset}
          total={data?.data?.total ?? 0}
          isPreviousData={isPreviousData}
          isLoading={isLoading}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          pdfHeader={pdfHeader}
          formatExcel={formatExcel}
        />
      </div>
    </>
  )
}
