import { useEffect, useState } from 'react'

import { flattenData } from '@/utils/misc'

import { type FieldWrapperPassThroughProps } from '@/components/Form'
import { type Device, type DeviceList } from '@/cloud/orgManagement'

import { SearchIcon } from '@/components/SVGIcons'
import { useTranslation } from 'react-i18next'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/Button'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import { cn } from '@/utils/misc'

type MapData = {
  entityName: string
  entityType: string
  id: string
}

type ComboBoxSelectDeviceDashboardProps = {
  data: MapData[]
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<Device[]>>
  offset?: number
} & FieldWrapperPassThroughProps

export function ComboBoxSelectDeviceDashboard({
  data,
  setFilteredComboboxData,
  offset,
  ...props
}: ComboBoxSelectDeviceDashboardProps) {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [value, setValue] = useState('')

  useEffect(() => {
    setFilteredComboboxData?.(data)
  }, [query])

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="flex h-full w-[200px] items-center justify-center ">
            <Button
              role="combobox"
              aria-expanded={open}
              className="flex w-[200px] items-center rounded bg-white py-1 !text-sm text-black"
            >
              {value
                ? data.find(item => item.id === value)?.entityName
                : t('combobox:select_device')}
              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] py-2">
          <Command>
            <CommandInput
              className={`block w-full appearance-none rounded-lg border border-secondary-600 px-3 py-1 text-sm placeholder-secondary-700 focus:border-secondary-900 focus:outline-none focus:ring-secondary-900 sm:text-body-sm`}
              onChangeCapture={event => setQuery(event.target.value)}
            />
            <CommandEmpty>{t('error:not_found')}</CommandEmpty>
            <CommandGroup>
              {data?.map(item => (
                <CommandItem
                  key={item.id}
                  className={`relative cursor-pointer select-none py-2 pl-10 pr-4`}
                  value={item.entityName}
                  onClick={() => {
                    setFilteredComboboxData?.([item])
                    setQuery(item.entityName)
                    setValue(item.id)
                  }}
                >
                  {item.entityName}
                  <CheckIcon
                    className={cn(
                      'ml-auto h-4 w-4',
                      value === item.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
