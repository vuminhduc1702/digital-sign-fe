import { Fragment, useState } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

type PropertyValuePair<K extends string> = {
  [key in K]: string
}

let extractedPropertyKeys: string[] = []

export function extractedComboboxData<
  T extends PropertyValuePair<K>,
  K extends string,
>(arr: T[], propertyKeys: K[], subArr?: keyof T): PropertyValuePair<K>[] {
  return arr?.reduce((acc: PropertyValuePair<string>[], obj: T) => {
    extractedPropertyKeys = propertyKeys
    const extractedObj = propertyKeys.reduce(
      (result, key) => ({ ...result, [key]: obj[key as keyof T] }),
      {},
    )
    acc.push(extractedObj)

    if (subArr && obj[subArr]) {
      acc.push(...extractedComboboxData(obj[subArr], propertyKeys, subArr))
    }

    return acc
  }, [])
}

export function ComboBox({ data }: { data: PropertyValuePair<string>[] }) {
  const [selected, setSelected] = useState(data?.[0])
  const [query, setQuery] = useState('')

  const filteredData =
    query === ''
      ? data
      : data.filter(data => {
          const searchValue = query.toLowerCase().replace(/\s+/g, '')
          return (
            data[extractedPropertyKeys[0]]
              .toLowerCase()
              .includes(searchValue) ||
            data[extractedPropertyKeys[1]]
              .toLowerCase()
              .replace(/\s+/g, '')
              .includes(searchValue)
          )
        })
  console.log('filteredData', filteredData)

  return (
    <div className="fixed top-16 w-72">
      <Combobox value={selected} onChange={setSelected}>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
              displayValue={(data: PropertyValuePair<string>) =>
                data[extractedPropertyKeys[1]]
              }
              onChange={event => setQuery(event.target.value)}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
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
                  Nothing found.
                </div>
              ) : (
                filteredData?.map(data => (
                  <Combobox.Option
                    key={data.id}
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
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
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
    </div>
  )
}
