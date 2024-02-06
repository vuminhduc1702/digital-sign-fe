import { Fragment, useState } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { useTranslation } from 'react-i18next'

import { FieldWrapper, type FieldWrapperPassThroughProps } from '../Form'

import { type IconProps } from '../Button'

export type ComboBoxBasePassThroughProps<T> = {
  hasDefaultComboboxData?: T
  selectedData?: T
}

type ComboBoxBaseProps<T extends Record<string, any>> = {
  data: T[]
  extractedPropertyKeys: string[]
  query: string
  setQuery: React.Dispatch<React.SetStateAction<string>>
  setFilteredComboboxData?: React.Dispatch<React.SetStateAction<T[]>>
  startIcon?: IconProps['startIcon']
  endIcon?: IconProps['endIcon']
} & FieldWrapperPassThroughProps &
  ComboBoxBasePassThroughProps<T>

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

export function ComboBoxBase<T extends Record<string, any>>({
  data,
  extractedPropertyKeys,
  query,
  setQuery,
  setFilteredComboboxData,
  startIcon,
  endIcon,
  label,
  error,
  hasDefaultComboboxData,
  selectedData,
}: ComboBoxBaseProps<T>) {
  const { t } = useTranslation()

  const comboboxData = hasDefaultComboboxData
    ? [hasDefaultComboboxData, ...data]
    : data

  const [selected, setSelected] = useState<T | {}>(selectedData || {})
  return (
    <FieldWrapper label={label} error={error}>
      <Combobox value={selected} onChange={setSelected}>
        <div className="relative">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-300 sm:text-body-sm">
            <Combobox.Input
              className={`block w-full appearance-none rounded-lg border border-secondary-600 px-3 py-2 placeholder-secondary-700 shadow-sm focus:border-secondary-900 focus:outline-none focus:ring-secondary-900 sm:text-body-sm ${
                startIcon ? 'pl-8' : ''
              }`}
              displayValue={(data: T) =>
                query !== ''
                  ? data[extractedPropertyKeys[1]]
                  : selectedData?.parent_name
              }
              onChange={event => setQuery(event.target.value)}
            />
            {startIcon ? (
              <Combobox.Button className="absolute inset-y-0 left-0 flex cursor-pointer items-center pl-2">
                {startIcon}
              </Combobox.Button>
            ) : null}
            {endIcon ? (
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                {endIcon}
              </Combobox.Button>
            ) : null}
            <XMarkIcon
              className="absolute right-0 top-1/2 mr-1 h-5 w-5 -translate-y-1/2 transform cursor-pointer opacity-50"
              onClick={() => setQuery('')}
            />
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-body-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {data?.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none px-4 py-2 text-secondary-700">
                  {t('error:not_found')}
                </div>
              ) : (
                comboboxData?.map(data => (
                  <Combobox.Option
                    key={data[extractedPropertyKeys[0]]}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-primary-300 text-white' : 'text-black'
                      }`
                    }
                    value={data}
                    onClick={() => {
                      setFilteredComboboxData?.([data])
                      setQuery(data[extractedPropertyKeys[1]])
                    }}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? 'font-medium' : 'font-normal'
                          }`}
                        >
                          {data[extractedPropertyKeys[1]]}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-white' : 'text-primary-400'
                            }`}
                          >
                            <CheckIcon
                              className="h-5 w-5 text-primary-400"
                              aria-hidden="true"
                            />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </FieldWrapper>
  )
}
