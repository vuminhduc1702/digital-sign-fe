import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import i18n from '@/i18n'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  placeholder,
  title,
  closeSearch,
  className,
  searchByFieldClassName,
  searchByNameClassName,
  placeholderValueText,
}: SearchFieldProps) {
  const { t } = useTranslation()
  const searchSchema = z.object({
    searchByField: z.string({
      required_error: i18n.t('search:no_search_field'),
    }),
    searchByName: z.string().min(1, {
      message: t('search:no_search_name'),
    }),
  })
  const form = useForm({
    resolver: searchSchema && zodResolver(searchSchema),
    defaultValues: {
      searchByName: '',
      searchByField: '',
    },
  })

  const {
    handleSubmit,
    formState: { errors },
  } = form

  function onSubmit() {
    if (searchField) {
      searchField.current = form.watch('searchByField')
    }
    setSearchValue && setSearchValue(form.watch('searchByName'))
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
          </div>
          <Button
            type="submit"
            className="h-[38px] w-[50px] items-center bg-[#DBDADE]"
            // onClick={() => {
            // }}
          >
            <LuSearch className="h-5 w-5 text-[#4B465C]" />
          </Button>
        </div>
      </form>
    </Form>
  )
}
