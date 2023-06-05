import { Controller } from 'react-hook-form'
import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/24/outline'

import { FieldWrapper, type FieldWrapperPassThroughProps } from '../Form'

import { SidebarDropDownIcon } from '../SVGIcons'

export type ListObj<T extends boolean | string | number> = {
  label: string
  value: T
}

type SelectMenuProps<T extends string | number | boolean> = {
  data: ListObj<T>[]
  selected: ListObj<T>
  setSelected: React.Dispatch<React.SetStateAction<ListObj<T>>>
} & FieldWrapperPassThroughProps

function SelectMenu<T extends string | number | boolean>({
  label,
  error,
  data,
  selected,
  setSelected,
}: // control,
SelectMenuProps<T>) {
  return (
    <FieldWrapper label={label} error={error}>
      {/* <Controller
        name="ReactSelect"
        control={control}
        render={({ field }) => (
          <Listbox {...field} value={selected} onChange={setSelected}>
            <div className="relative">
              <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-secondary-600 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-600 sm:text-body-sm">
                <span className="block truncate">{selected?.name}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <SidebarDropDownIcon
                    className="text-primary-400"
                    width={12}
                    height={7}
                    viewBox="0 0 12 7"
                  />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-body-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {data.map((item, index) => (
                    <Listbox.Option
                      key={index}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active && 'bg-primary-300 text-white'
                        }`
                      }
                      value={item}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? 'font-medium' : 'font-normal'
                            }`}
                          >
                            {item.name}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                              <CheckIcon
                                className="h-5 w-5 text-primary-400"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        )}
      /> */}
      <Listbox value={selected} onChange={setSelected}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-secondary-600 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-600 sm:text-body-sm">
            <span className="block truncate">{selected?.label}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <SidebarDropDownIcon
                className="text-primary-400"
                width={12}
                height={7}
                viewBox="0 0 12 7"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-body-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {data.map((item, index) => (
                <Listbox.Option
                  key={index}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active && 'bg-primary-300 text-white'
                    }`
                  }
                  value={item}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {item.label}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <CheckIcon
                            className="h-5 w-5 text-primary-400"
                            aria-hidden="true"
                          />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </FieldWrapper>
  )
}

export default SelectMenu
