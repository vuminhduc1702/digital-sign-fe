import { useState } from 'react'

import storage from '~/utils/storage'

import { useTranslation } from 'react-i18next'
import { Button } from '~/components/Button'
import { InputField, SelectDropdown, SelectField } from '~/components/Form'
import TitleBar from '~/components/Head/TitleBar'
import { SearchIcon } from '~/components/SVGIcons'
import { type SearchFilter, useGetBillings } from '../api/billingAPI'
import { BillingTable } from '../components/Billing'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '~/utils/misc'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/Popover'
import { Calendar } from '~/components/Calendar'
import { type DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import { searchSubcriptionSchema } from '~/cloud/subcription/routes/SubcriptionTemplate'
import { zodResolver } from '@hookform/resolvers/zod'

export function BillingTemplate() {
  const { t } = useTranslation()
  const [offset, setOffset] = useState(0)
  const [searchFilter, setSearchFilter] = useState<SearchFilter>({})
  const [searchData, setsearchData] = useState<SearchFilter>({})
  const [startTime, setStartTime] = useState<number | undefined>()
  const [endTime, setEndTime] = useState<number | undefined>()
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })
  const projectId = storage.getProject()?.id
  const { data, isPreviousData } = useGetBillings({
    projectId,
    searchFilter: searchFilter,
    start_time: startTime,
    searchData: searchData,
    end_time: endTime,
    config: { keepPreviousData: true, staleTime: 0 },
  })

  const handleField = (field: string, value: any) => {
    const newObj: SearchFilter = {}
    newObj[field] = value
    setsearchData(newObj)
  }

  const { register, formState, control, handleSubmit } = useForm({
    resolver: searchSubcriptionSchema && zodResolver(searchSubcriptionSchema),
    defaultValues: { value: '', key: '' },
  })

  return (
    <>
      {/* <TitleBar title={t('sidebar:payment.plhd')} /> */}
      <div className="relative flex grow flex-col px-9 py-3 shadow-lg rounded-md bg-gray-50">
        <div className="flex justify-between mb-5">
          <form
            id="search-subcription"
            className="flex flex-col justify-between space-y-6"
            onSubmit={handleSubmit(values => {
              const newObj: SearchFilter = {}
              newObj[values.key] = values.value
              setStartTime(
                date?.from?.getTime() && date?.from?.getTime() / 1000,
              )
              setEndTime(date?.to?.getTime() && date?.to?.getTime() / 1000)
              setSearchFilter(newObj)
            })}
          >
            <div className="flex items-center gap-x-3">
              <SelectDropdown
                isClearable={false}
                name="key"
                control={control}
                options={[
                  { label: 'Số hóa đơn', value: 'id' },
                  { label: 'Tên khách hàng', value: 'customer_name' },
                ]}
                // error={formState?.errors?.key}
              />
              <InputField
                className="mt-1 h-[37px]"
                error={formState.errors['value']}
                registration={register('value')}
              />
              <div className={cn('grid gap-2')}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="trans"
                      className={cn(
                        'relative mt-1 h-[37px] w-[300px] justify-start rounded-md text-left font-normal ',
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
                        <XMarkIcon
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
        </div>
        <BillingTable
          data={data?.data?.data}
          offset={offset}
          setOffset={setOffset}
          handleField={handleField}
          total={data?.data?.total ?? 0}
          isPreviousData={isPreviousData}
        />
      </div>
    </>
  )
}
