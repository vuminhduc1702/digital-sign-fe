import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { Fragment, useEffect, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/24/outline'

import { Button } from '~/components/Button'
import { Form, InputField } from '~/components/Form'
import { type UpdateAttrDTO, useUpdateAttr } from '../api/updateAttr'
import { useOrgIdStore } from '~/stores/org'
import { loggedList, valueTypeList } from './CreateAttr'
import { Drawer } from '~/components/Drawer'
import { useGetAttr } from '../api/getAttr'
import { Spinner } from '~/components/Spinner'
import { useSpinDelay } from 'spin-delay'

import { type EntityType } from '~/cloud/orgManagement/api/createAttr'

import { SidebarDropDownIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'

export const attrSchema = z.object({
  attribute_key: z.string().min(1, 'Vui lòng nhập để tiếp tục').max(30),
  value: z.string().optional(),
})

type CreateAttrProps = {
  entityType: EntityType
  attributeKey: string
  close: () => void
  isOpen: boolean
}
export function UpdateAttr({
  entityType,
  attributeKey,
  close,
  isOpen,
}: CreateAttrProps) {
  const { t } = useTranslation()

  const orgId = useOrgIdStore(state => state.orgId)

  const [selectedValueType, setSelectedValueType] = useState(valueTypeList[0])
  const [selectedLogged, setSelectedLogged] = useState(loggedList[0])
  const logged = selectedLogged.type
  const valueType = selectedValueType.type

  const { mutate, isLoading, isSuccess } = useUpdateAttr()

  const { data: attrData, isLoading: attrLoading } = useGetAttr({
    entityType,
    entityId: orgId,
    attrKey: attributeKey,
    config: { suspense: false },
  })

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  const showSpinner = useSpinDelay(attrLoading, {
    delay: 150,
    minDuration: 300,
  })

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      title={t('cloud.org_manage.org_info.add_org.edit')}
      renderFooter={() => (
        <>
          <Button
            className="rounded border-none"
            variant="secondary"
            size="lg"
            onClick={close}
            startIcon={
              <img src={btnCancelIcon} alt="Submit" className="h-5 w-5" />
            }
          />
          <Button
            className="rounded border-none"
            form="update-org"
            type="submit"
            size="lg"
            isLoading={isLoading}
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
          />
        </>
      )}
    >
      {attrLoading ? (
        <div className="flex grow items-center justify-center">
          <Spinner showSpinner={showSpinner} size="xl" />
        </div>
      ) : (
        <Form<UpdateAttrDTO['data']['attributes'][0], typeof attrSchema>
          id="update-attr"
          onSubmit={values => {
            mutate({
              data: {
                attributes: [
                  {
                    attribute_key: values.attribute_key,
                    value: values.value,
                    logged: logged,
                    value_t: valueType,
                  },
                ],
              },
              entityType,
              orgId,
            })
          }}
          schema={attrSchema}
          options={{
            defaultValues: {
              attribute_key: attrData?.attribute_key,
              value: attrData?.value,
              logged: attrData?.logged,
              value_t: attrData?.value_type,
            },
          }}
        >
          {({ register, formState }) => (
            <>
              <InputField
                label={t('cloud.org_manage.org_info.add_attr.name') ?? 'Name'}
                error={formState.errors['attribute_key']}
                registration={register('attribute_key')}
              />
              <Listbox
                value={selectedValueType}
                onChange={setSelectedValueType}
              >
                <div className="relative mt-1">
                  <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-secondary-600 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-600 sm:text-body-sm">
                    <span className="block truncate">
                      {selectedValueType.name}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <SidebarDropDownIcon
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
                      {valueTypeList.map((valueType, valueTypeIdx) => (
                        <Listbox.Option
                          key={valueTypeIdx}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active && 'bg-primary-300 text-white'
                            }`
                          }
                          value={valueType}
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? 'font-medium' : 'font-normal'
                                }`}
                              >
                                {valueType.name}
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
              <InputField
                label={t('cloud.org_manage.org_info.add_attr.value') ?? 'Value'}
                error={formState.errors['value']}
                registration={register('value')}
              />
              <Listbox value={selectedLogged} onChange={setSelectedLogged}>
                <div className="relative mt-1">
                  <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-secondary-600 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-600 sm:text-body-sm">
                    <span className="block truncate">
                      {selectedLogged.name}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <SidebarDropDownIcon
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
                      {loggedList.map((logged, loggedIdx) => (
                        <Listbox.Option
                          key={loggedIdx}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active && 'bg-primary-300 text-white'
                            }`
                          }
                          value={logged}
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? 'font-medium' : 'font-normal'
                                }`}
                              >
                                {logged.name}
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
            </>
          )}
        </Form>
      )}
    </Drawer>
  )
}
