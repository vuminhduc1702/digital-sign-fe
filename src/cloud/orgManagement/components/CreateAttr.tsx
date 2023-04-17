import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/24/outline'

import { Button } from '~/components/Button'
import { Form, FormDrawer, InputField, SelectField } from '~/components/Form'
import {
  type CreateAttrDTO,
  useCreateAttr,
  type EntityType,
} from '~/cloud/orgManagement/api/createAttr'
import { type Attribute } from '~/layout/MainLayout/types'

import { PlusIcon, SidebarDropDownIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

type ValueType = {
  type: Attribute['value_type']
  name: string
}

export const valueTypeList: ValueType[] = [
  { type: 'STR', name: 'String' },
  { type: 'BOOL', name: 'Boolean' },
  { type: 'LONG', name: 'Long' },
  { type: 'DBL', name: 'Double' },
  { type: 'JSON', name: 'JSON' },
]

export const loggedList = [
  { type: true, name: 'Có' },
  { type: false, name: 'Không' },
]

export const attrSchema = z.object({
  attribute_key: z.string().min(1, 'Vui lòng nhập để tiếp tục').max(30),
  value: z.string().optional(),
})

type CreateAttrProps = {
  entityId: string
  entityType: EntityType
}
export function CreateAttr({ entityId, entityType }: CreateAttrProps) {
  const { t } = useTranslation()

  const [selectedValueType, setSelectedValueType] = useState(valueTypeList[0])
  const [selectedLogged, setSelectedLogged] = useState(loggedList[0])
  const logged = selectedLogged.type
  const valueType = selectedValueType.type

  const { mutate, isLoading, isSuccess } = useCreateAttr()

  // TODO: Figure out to put logged and valueType into react-hook-form

  // TODO: Choose bool valueType then InputField switch to Listbox

  return (
    <FormDrawer
      isDone={isSuccess}
      triggerButton={
        <Button
          className="h-9 w-9 rounded-md"
          variant="trans"
          size="square"
          startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
      }
      title={t('cloud.org_manage.org_info.add_attr.title')}
      submitButton={
        <Button
          className="rounded border-none"
          form="create-attr"
          type="submit"
          size="lg"
          isLoading={isLoading}
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    >
      <Form<CreateAttrDTO['data']['attributes'][0], typeof attrSchema>
        id="create-attr"
        onSubmit={values => {
          mutate({
            data: {
              entity_id: entityId,
              entity_type: entityType,
              attributes: [
                {
                  attribute_key: values.attribute_key,
                  value: values.value,
                  logged: logged,
                  value_t: valueType,
                },
              ],
            },
          })
        }}
        schema={attrSchema}
      >
        {({ register, formState }) => (
          <>
            <InputField
              label={t('cloud.org_manage.org_info.add_attr.name') ?? 'Name'}
              error={formState.errors['attribute_key']}
              registration={register('attribute_key')}
            />
            <Listbox value={selectedValueType} onChange={setSelectedValueType}>
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
            {/* <SelectField
              label={
                t('cloud.org_manage.org_info.add_attr.value_type') ??
                'Value type'
              }
              error={formState.errors['value_t']}
              registration={register('value_t')}
              options={valueTypeList.map(valueType => ({
                label: valueType.name,
                value: valueType.type,
              }))}
            /> */}
            <InputField
              label={t('cloud.org_manage.org_info.add_attr.value') ?? 'Value'}
              error={formState.errors['value']}
              registration={register('value')}
            />
            <Listbox value={selectedLogged} onChange={setSelectedLogged}>
              <div className="relative mt-1">
                <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-secondary-600 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-600 sm:text-body-sm">
                  <span className="block truncate">{selectedLogged.name}</span>
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
            {/* <SelectField
              label={t('cloud.org_manage.org_info.add_attr.logged') ?? 'Logged'}
              error={formState.errors['logged']}
              registration={register('logged')}
              options={loggedList.map(logged => ({
                label: logged.name,
                value: logged.type,
              }))}
            /> */}
          </>
        )}
      </Form>
    </FormDrawer>
  )
}
