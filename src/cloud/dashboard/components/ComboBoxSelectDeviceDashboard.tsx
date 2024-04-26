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
import { CheckIcon } from '@radix-ui/react-icons'
import { cn } from '@/utils/misc'

export function filteredComboboxData<T, K extends keyof T>(
  query: string,
  flattenData: T[],
  extractedPropertyKeys: K[],
) {
  const filteredData =
    query === ''
      ? flattenData
      : flattenData?.filter(data => {
          const searchValue = query.toLowerCase().replace(/\s+/g, '')
          return extractedPropertyKeys.some(key =>
            (data[key] as unknown as string)
              ?.toString()
              .toLowerCase()
              .replace(/\s+/g, '')
              .includes(searchValue),
          )
        })

  return filteredData
}

type ComboBoxSelectDeviceDashboardProps = {
  data: DeviceList
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<Device[]>>
  offset?: number
} & FieldWrapperPassThroughProps

export function ComboBoxSelectDeviceDashboard({
  data,
  setFilteredComboboxData,
  offset,
  ...props
}: ComboBoxSelectDeviceDashboardProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [value, setValue] = useState('')

  const { acc: deviceFlattenData, extractedPropertyKeys } = flattenData(data, [
    'id',
    'entityName',
  ])

  const filteredData = filteredComboboxData(
    query,
    deviceFlattenData,
    extractedPropertyKeys,
  )

  useEffect(() => {
    setFilteredComboboxData?.(filteredData)
  }, [query])

  return (
    <div>
      <Command>
        <CommandInput
          className={`block w-full appearance-none rounded-lg border border-secondary-600 px-3 py-2 placeholder-secondary-700 shadow-sm focus:border-secondary-900 focus:outline-none focus:ring-secondary-900 sm:text-body-sm`}
          onChangeCapture={event => setQuery(event.target.value)}
        />
        <CommandEmpty>{t('error:not_found')}</CommandEmpty>
        <CommandGroup>
          {filteredData?.map(item => (
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
    </div>
  )
}
