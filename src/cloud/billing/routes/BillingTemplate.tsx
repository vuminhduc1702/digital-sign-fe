import { useState } from 'react'

import storage from '~/utils/storage'

import { useTranslation } from 'react-i18next'
import { Button } from '~/components/Button'
import { InputField, SelectField } from '~/components/Form'
import TitleBar from '~/components/Head/TitleBar'
import { SearchIcon } from '~/components/SVGIcons'
import { type SearchFilter, useGetBillings } from '../api/billingAPI'
import { BillingTable } from '../components/Billing'
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from '~/utils/misc'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/Popover'
import { Calendar } from '~/components/Calendar'
import { type DateRange } from 'react-day-picker'
import { format } from "date-fns"

export function BillingTemplate() {
  const { t } = useTranslation()
  const [offset, setOffset] = useState(0)
  const [key, setKey] = useState('id')
  const [searchFilter, setSearchFilter] = useState<SearchFilter>({})
  const [value, setValue] = useState('')
  const [startTime, setStartTime] = useState<number | undefined>()
  const [endTime, setEndTime] = useState<number | undefined>()
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })
  const { id: projectId } = storage.getProject()
  const { data, isPreviousData } = useGetBillings({
    projectId,
    searchFilter: searchFilter,
    start_time: startTime,
    end_time: endTime,
    config: { keepPreviousData: true },
  })

  const handleSearch = () => {
    const newObj: SearchFilter = {}
    newObj[key] = value
    setStartTime(date?.from?.getTime() && date?.from?.getTime() / 1000)
    setEndTime(date?.to?.getTime() && date?.to?.getTime() / 1000)
    setSearchFilter(newObj)
  }

  return (
    <>
      <TitleBar title={t('sidebar:payment.plhd')} />
      <div className="flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <div className="flex items-center gap-x-3">
            <SelectField
              options={[
                { label: 'Số hóa đơn', value: 'id' },
                { label: 'Tên khách hàng', value: 'customer_name' },
              ]}
              onChange={e => {
                setKey(e.target.value)
              }}
              value={key}
            />
            <InputField
              value={value}
              onChange={e => setValue(e.target.value)}
            />
            <div className={cn("grid gap-2")}>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="trans"
                    className={cn(
                      "w-[300px] justify-start rounded-md text-left font-normal ",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "dd MM, y")} -{" "}
                          {format(date.to, "dd MM, y")}
                        </>
                      ) : (
                        format(date.from, "dd MM, y")
                      )
                    ) : (
                      <span>Pick a date</span>
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
              onClick={handleSearch}
            />
          </div>
        </div>
        <BillingTable
          data={data?.data?.data}
          offset={offset}
          setOffset={setOffset}
          total={data?.data?.total ?? 0}
          isPreviousData={isPreviousData}
        />
      </div>
    </>
  )
}