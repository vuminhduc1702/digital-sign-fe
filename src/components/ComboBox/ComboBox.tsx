import { Fragment, useState } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/20/solid'
import { useTranslation } from 'react-i18next'

import { type IconProps } from '../Button'

import { PropertyValuePair } from '~/utils/misc'

export function ComboBox({
  data,
  extractedPropertyKeys,
  startIcon,
  endIcon,
}: {
  data: PropertyValuePair<string>[]
  extractedPropertyKeys: string[]
  startIcon?: IconProps['startIcon']
  endIcon?: IconProps['endIcon']
}) {
  const { t } = useTranslation()

  const [selected, setSelected] = useState(data?.[0])
  const [query, setQuery] = useState('')

  const filteredData =
    query === ''
      ? data
      : data.filter(data => {
          const searchValue = query.toLowerCase().replace(/\s+/g, '')
          return extractedPropertyKeys.some(key =>
            data[key]
              .toString()
              .toLowerCase()
              .replace(/\s+/g, '')
              .includes(searchValue),
          )
        })

  return (
    <Combobox value={selected} onChange={setSelected}>
      <div className="relative mt-1">
        <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
          <Combobox.Input
            className={`block w-full appearance-none rounded-lg border border-gray-400 px-3 py-2 placeholder-gray-700 shadow-sm focus:border-gray-700 focus:outline-none focus:ring-gray-700 sm:text-sm ${
              startIcon ? 'pl-8' : ''
            }`}
            displayValue={(data: PropertyValuePair<string>) =>
              data[extractedPropertyKeys[1]]
            }
            onChange={event => setQuery(event.target.value)}
          />
          {startIcon ? (
            <Combobox.Button className="absolute inset-y-0 left-0 flex cursor-default items-center pl-2">
              {startIcon}
            </Combobox.Button>
          ) : null}
          {endIcon ? (
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              {endIcon}
            </Combobox.Button>
          ) : null}
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery('')}
        >
          <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredData?.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                {t('error.not_found')}
              </div>
            ) : (
              filteredData?.map(data => (
                <Combobox.Option
                  key={data[extractedPropertyKeys[0]]}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-teal-600 text-white' : 'text-gray-900'
                    }`
                  }
                  value={data}
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
                            active ? 'text-white' : 'text-teal-600'
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
  )
}
