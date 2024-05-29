import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import i18n from '@/i18n'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { type DateRange } from 'react-day-picker'
import { Calendar as CalendarIcon } from 'lucide-react'
import { HiOutlineXMark } from 'react-icons/hi2'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuSearch, LuX } from 'react-icons/lu'
import { cn } from '@/utils/misc'
import React from 'react'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

type SearchFieldProps = {
  setSearchValue?: React.Dispatch<React.SetStateAction<string>>
  searchField?: React.MutableRefObject<string>
  fieldOptions?: { value: string; label: string }[]
  setIsSearchData?: React.Dispatch<React.SetStateAction<boolean>>
  date?: DateRange | undefined
  setDate?: React.Dispatch<React.SetStateAction<DateRange | undefined>>
  placeholder?: string
  title?: string
  closeSearch?: boolean
  className?: string
  searchByFieldClassName?: string
  searchByNameClassName?: string
  placeholderValueText?: string
}

export function SearchField({
  setSearchValue,
  searchField,
  fieldOptions,
  setIsSearchData,
  date,
  setDate,
  placeholder,
  title,
  closeSearch,
  className,
  searchByFieldClassName,
  searchByNameClassName,
  placeholderValueText,
}: SearchFieldProps) {
  const { t } = useTranslation()
  const defaultFieldOption =
    fieldOptions && fieldOptions.length > 0 ? fieldOptions[0].value : ''
  const searchSchema = z.object({
    searchByField: z.string({
      required_error: i18n.t('search:no_search_field'),
    }),
    searchByName: z.string().min(1, {
      message: t('search:no_search_name'),
    }),
    from: z.string().optional(),
    to: z.string().optional(),
  })
  const form = useForm({
    resolver: searchSchema && zodResolver(searchSchema),
    defaultValues: {
      searchByName: '',
      searchByField: defaultFieldOption,
    },
  })

  const {
    handleSubmit,
    formState: { errors },
    watch,
  } = form

  function onSubmit() {
    if (searchField) {
      searchField.current = form.watch('searchByField')
    }
    setSearchValue && setSearchValue(form.watch('searchByName'))
    setDate && setDate(date)
    setIsSearchData && setIsSearchData(true)
    setTimeout(() => {
      setIsSearchData && setIsSearchData(false)
    }, 1000)
    // e.preventDefault()
  }
  return (
    <Form {...form}>
      <form className={cn(className)} onSubmit={handleSubmit(onSubmit)}>
        <div className="flex h-full flex-row items-center gap-[14px] 2xl:items-center">
          <div className="flex flex-col items-center gap-[14px] 2xl:flex-row">
            {title && <div className="hidden text-sm 2xl:flex">{title}</div>}
            {searchField && (
              <FormField
                control={form.control}
                name="searchByField"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Select
                          {...field}
                          onValueChange={value => {
                            form.setValue('searchByField', value)
                            form.clearErrors('searchByField')
                          }}
                        >
                          <SelectTrigger
                            className={cn(
                              'h-[38px] min-w-[250px] px-[12px] py-[8px] text-sm',
                              searchByFieldClassName,
                            )}
                          >
                            <SelectValue
                              placeholder={
                                placeholderValueText ?? t('table:search_field')
                              }
                            />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {fieldOptions?.map(
                              (option: { value: string; label: string }) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        {form.formState.errors.searchByField?.message && (
                          <div className="mt-1 text-xs text-red-500 2xl:absolute 2xl:bottom-[-15px]">
                            {form.formState.errors.searchByField?.message}
                          </div>
                        )}
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="searchByName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="text"
                        className={cn(
                          'h-[38px] min-w-[250px] px-[12px] py-[8px] text-sm',
                          closeSearch ? 'pr-[36px]' : 'pr-[12px]',
                          searchByNameClassName,
                        )}
                        placeholder={placeholder ?? t('search:title')}
                        endIcon={
                          closeSearch &&
                          form.watch('searchByName').length > 0 ? (
                            <LuX
                              className="absolute right-[12px] top-1/4 h-[50%] cursor-pointer"
                              onClick={() => {
                                form.setValue('searchByName', '')
                                setSearchValue && setSearchValue('')
                              }}
                            />
                          ) : undefined
                        }
                      />
                      {form.formState.errors.searchByName?.message && (
                        <div className="mt-1 text-xs text-red-500 2xl:absolute 2xl:bottom-[-15px]">
                          {form.formState.errors.searchByName?.message}
                        </div>
                      )}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            {date && setDate && (
              <div className="relative">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="trans"
                      className={cn(
                        'h-[38px] min-w-[250px] justify-start bg-white px-[12px] py-[8px] text-sm font-normal',
                        !date && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, 'dd/MM, y')} -{' '}
                            {format(date.to, 'dd/MM, y')}
                          </>
                        ) : (
                          format(date.from, 'dd/MM, y')
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
            )}
          </div>
          <Button
            type="submit"
            className="h-[38px] w-[50px] items-center bg-[#DBDADE]"
          >
            <LuSearch className="h-5 w-5 text-[#4B465C]" />
          </Button>
        </div>
      </form>
    </Form>
  )
}
