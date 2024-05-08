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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/Button'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import { cn } from '@/utils/misc'
import { useDisclosure } from '@/utils/hooks'
import { LuX, LuSearch } from 'react-icons/lu'

export type MapData = {
  entityName: string
  entityType: string
  id: string
}

type ComboBoxSelectDeviceDashboardProps = {
  data: MapData[]
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<MapData[]>>
  setSearchWidget?: React.Dispatch<React.SetStateAction<string>>
} & FieldWrapperPassThroughProps

export function ComboBoxSelectDeviceDashboard({
  data,
  setFilteredComboboxData,
  setSearchWidget,
  ...props
}: ComboBoxSelectDeviceDashboardProps) {
  const { close, open, isOpen } = useDisclosure()
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [filterData, setFilterData] = useState<MapData[]>(data)

  useEffect(() => {
    setFilterData(data)
  }, [data])

  return (
    <Popover defaultOpen={isOpen} onOpenChange={open}>
      <PopoverTrigger asChild className="outline-none">
        <div className="flex h-full w-[200px] items-center justify-center hover:border-none">
          <Input
            type="text"
            placeholder={t('combobox:select_device')}
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              const filteredData = data.filter(
                item =>
                  item.entityName
                    .toLowerCase()
                    .includes(e.target.value.toLowerCase()) ||
                  item.id.toLowerCase().includes(e.target.value.toLowerCase()),
              )
              setFilterData(filteredData)
            }}
            endIcon={
              <>
                {query.length > 0 ? (
                  <LuX
                    className="absolute right-6 top-1/4 h-[50%] cursor-pointer"
                    onClick={() => {
                      setQuery('')
                      setFilteredComboboxData?.(data)
                    }}
                  />
                ) : undefined}
                <LuSearch
                  className="absolute right-2 h-[50%] cursor-pointer text-[#4B465C]"
                  // onClick={() => {
                  //   if (query.length === 0) {
                  //     setFilteredComboboxData?.(data)
                  //   } else {
                  //     const filteredData = data.filter(
                  //       item =>
                  //         item.entityName
                  //           .toLowerCase()
                  //           .includes(query.toLowerCase()) ||
                  //         item.id.toLowerCase().includes(query.toLowerCase()),
                  //     )
                  //     console.log(filteredData)
                  //     setFilteredComboboxData?.(filteredData)
                  //   }
                  //   open()
                  // }}
                />
              </>
            }
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[200px] py-2"
        onCloseAutoFocus={e => e.preventDefault()}
      >
        {filterData?.length === 0 ? (
          <div>{t('error:not_found')}</div>
        ) : (
          filterData?.map(item => (
            <div
              key={item.id}
              className={`relative cursor-pointer select-none py-2`}
              onClick={() => {
                const displayQuery = item.entityName
                  ? item.entityName + ' - ' + item.id
                  : item.id
                setQuery(displayQuery)
                setFilteredComboboxData?.([item])
                close()
              }}
            >
              {item?.entityName
                ? item?.entityName + ' - ' + item?.id
                : item?.id}
            </div>
          ))
        )}
      </PopoverContent>
    </Popover>
  )
}
