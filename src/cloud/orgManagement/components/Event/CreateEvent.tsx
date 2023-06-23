import { useParams } from 'react-router-dom'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

import { Button } from '~/components/Button'
import {
  FormDrawer,
  FormMultipleFields,
  InputField,
  SelectField,
  SelectDropdown,
} from '~/components/Form'
import { useProjectIdStore } from '~/stores/project'
import { ComboBoxSelectOrg } from '~/layout/MainLayout/components'
import { useDefaultCombobox } from '~/utils/hooks'
import { useCreateEvent, type CreateEventDTO } from '../../api/eventAPI'
import { ComboBoxSelectGroup } from '../Group'
import { useGetGroups } from '../../api/groupAPI'
import { nameSchema } from '~/utils/schemaValidation'
import { useGetDevices } from '../../api/deviceAPI'
import { useGetAttrs } from '../../api/attrAPI'
import { queryClient } from '~/lib/react-query'

import { type OrgMapType } from '~/layout/OrgManagementLayout/components/OrgManageSidebar'
import { type DeviceList, type Group } from '../../types'
import { type Attribute } from '~/types'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import TitleBar from '~/components/Head/TitleBar'

const conditionObj = z.object({
  device_id: z.string(),
  attribute_name: z.string(),
  condition_type: z.enum(['normal', 'delay'] as const),
  operator: z.enum(['<', '>', '!='] as const),
  // threshold: z.string(),
  // logical_operator: z.enum(['and', 'or'] as const),
})
type ConditionObj = z.infer<typeof conditionObj>
export const eventConditionSchema = z.array(conditionObj)

export const eventIntervalSchema = z.object({
  monday: z.boolean().optional(),
  tuesday: z.boolean().optional(),
  wednesday: z.boolean().optional(),
  thursday: z.boolean().optional(),
  friday: z.boolean().optional(),
  saturday: z.boolean().optional(),
  sunday: z.boolean().optional(),
  start_time: z.string(),
  end_time: z.string(),
})

export const eventActionSchema = z
  .array(
    z.object({ receiver: z.string() }).and(
      z.discriminatedUnion('action_type', [
        z.object({
          action_type: z.literal('email'),
          subject: z.string(),
          message: z.string(),
        }),
        z.object({
          action_type: z.enum(['eventactive', 'delay'] as const),
          subject: z.string().optional(),
          message: z.string().optional(),
        }),
        z.object({
          action_type: z.enum(['sms', 'mqtt', 'fcm', 'event'] as const),
          subject: z.string().optional(),
          message: z.string(),
        }),
      ]),
    ),
  )
  .optional()

export const createEventSchema = z
  .object({
    project_id: z.string().optional(),
    org_id: z.string().optional(),
    group_id: z.string().optional(),
    name: nameSchema,
    // interval: intervalSchema,
    // action: eventActionSchema
    // status: z.boolean().optional(),
    // retry: z.number().optional(),
    // onClick: z.boolean(),
    // condition: eventConditionSchema,
  })
  .and(
    z.discriminatedUnion('onClick', [
      z.object({
        onClick: z.literal('true'),
        condition: z.void(),
      }),
      z.object({
        onClick: z.literal('false'),
        condition: eventConditionSchema,
      }),
    ]),
  )
const defaultConditionValue: ConditionObj = {
  device_id: '',
  attribute_name: '',
  condition_type: 'normal',
  operator: '>',
}

export function CreateEvent() {
  const { t } = useTranslation()

  const defaultComboboxOrgData = useDefaultCombobox('org')

  const [filteredComboboxOrgData, setFilteredComboboxOrgData] = useState<
    OrgMapType[]
  >([])
  const selectedOrgId =
    filteredComboboxOrgData.length !== 1 ? '' : filteredComboboxOrgData[0]?.id

  const [filteredComboboxGroupData, setFilteredComboboxGroupData] = useState<
    Group[]
  >([])
  const selectedGroupId =
    filteredComboboxGroupData.length !== 1
      ? ''
      : filteredComboboxGroupData[0]?.id

  const [onClickValue, setOnclickValue] = useState(false)

  const projectId = useProjectIdStore(state => state.projectId)
  const { mutate, isLoading, isSuccess } = useCreateEvent()

  const params = useParams()
  const orgId = params.orgId as string

  const { data: groupData, isSuccess: isSuccessGroupData } = useGetGroups({
    orgId,
    projectId,
    // config: { enabled: false }
  })
  // const groupListCache: Group[] | undefined = queryClient.getQueryData(
  //   ['groups'],
  //   {
  //     exact: false,
  //   },
  // )

  const { data: deviceData, refetch: refetchDeviceData } = useGetDevices({
    orgId,
    projectId,
    config: { enabled: false },
  })
  const deviceListCache: DeviceList | undefined = queryClient.getQueryData(
    ['devices'],
    {
      exact: false,
    },
  )
  const deviceSelectData = deviceData?.devices.map(device => ({
    value: device.id,
    label: device.name,
  })) || [{ value: '', label: '' }]

  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  const { data: attrData, refetch: refetchAttrData } = useGetAttrs({
    entityType: 'DEVICE',
    entityId: selectedDeviceId,
    config: { enabled: false },
  })
  const attrListCache: Attribute[] | undefined = queryClient.getQueryData(
    ['attrs'],
    {
      exact: false,
    },
  )
  const attrSelectData = attrData?.attributes.map(attribute => ({
    value: attribute.attribute_key,
    label: attribute.attribute_key,
  })) || [{ value: '', label: '' }]

  return (
    <FormDrawer
      isDone={isSuccess}
      triggerButton={
        <Button
          className="rounded-md"
          variant="trans"
          size="square"
          startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
      }
      title={t('cloud:org_manage.event_manage.add_event.title')}
      submitButton={
        <Button
          className="rounded border-none"
          form="create-event"
          type="submit"
          size="lg"
          isLoading={isLoading}
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    >
      <FormMultipleFields<CreateEventDTO['data'], typeof createEventSchema>
        id="create-event"
        onSubmit={values => {
          console.log('values: ', values)
          const conditionArr =
            values.condition?.map(item => ({
              device_id: (
                item.device_id as unknown as { value: string; label: string }
              ).value,
              attribute_name: (
                item.attribute_name as unknown as {
                  value: string
                  label: string
                }
              ).value,
              condition_type: (
                item.condition_type as unknown as {
                  value: 'normal' | 'delay'
                  label: string
                }
              ).value,
              operator: (
                item.operator as unknown as {
                  value: '!=' | '<' | '>'
                  label: string
                }
              ).value,
            })) || []
          mutate({
            data: {
              project_id: projectId,
              org_id: selectedOrgId,
              group_id: selectedGroupId,
              name: values.name,
              onClick: values.onClick === 'true',
              condition: values.onClick === 'false' ? conditionArr : null,
            },
          })
        }}
        schema={createEventSchema}
        // options={{
        //   defaultValues: {
        //     condition: [defaultConditionValue],
        //   },
        // }}
        name={['condition', 'action']}
      >
        {(
          { register, formState, control, watch },
          {
            append: conditionAppend,
            fields: conditionFields,
            remove: conditionRemove,
          },
          { append: actionAppend, fields: actionFields, remove: actionRemove },
        ) => {
          console.log('errors zod: ', formState.errors)
          return (
            <>
              <button
                type="button"
                onClick={() => conditionAppend(defaultConditionValue)}
              >
                APPEND
              </button>
              <InputField
                label={t('cloud:org_manage.event_manage.add_event.name')}
                error={formState.errors['name']}
                registration={register('name')}
              />
              <ComboBoxSelectOrg
                label={t('cloud:org_manage.event_manage.add_event.parent')}
                setFilteredComboboxData={setFilteredComboboxOrgData}
                hasDefaultComboboxData={defaultComboboxOrgData}
              />
              {isSuccessGroupData ? (
                <ComboBoxSelectGroup
                  label={t('cloud:org_manage.event_manage.add_event.group')}
                  data={groupData}
                  setFilteredComboboxData={setFilteredComboboxGroupData}
                />
              ) : null}
              <SelectField
                label={t(
                  'cloud:org_manage.event_manage.add_event.condition.onClick',
                )}
                error={formState.errors['onClick']}
                registration={register('onClick')}
                options={[
                  { value: 'false', label: 'Không' },
                  { value: 'true', label: 'Có' },
                ]}
                onChange={event =>
                  setOnclickValue(
                    String(event.target.value).toLowerCase() === 'true',
                  )
                }
              />

              {!onClickValue
                ? conditionFields.map((field, index) => {
                    return (
                      <>
                        <TitleBar
                          title={t(
                            'cloud:org_manage.event_manage.add_event.condition.title',
                          )}
                          className="bg-gray-500 pl-3"
                        />
                        <section
                          className="space-y-3"
                          style={{ marginTop: '10px' }}
                          key={field.id}
                        >
                          <SelectDropdown
                            label={t(
                              'cloud:org_manage.event_manage.add_event.condition.device',
                            )}
                            name={`condition.${index}.device_id`}
                            options={
                              deviceData
                                ? deviceSelectData
                                : [{ label: t('loading:device'), value: '' }]
                            }
                            isOptionDisabled={option =>
                              option.label === t('loading:device')
                            }
                            noOptionsMessage={() => t('table:no_device')}
                            control={control}
                            closeMenuOnSelect
                            onMenuOpen={() => {
                              if (deviceListCache?.devices) {
                                return
                              } else refetchDeviceData()
                            }}
                            onMenuClose={() => {
                              const deviceId = watch(
                                // @ts-expect-error
                                'condition.0.device_id.value',
                              ) as unknown as string
                              setSelectedDeviceId(deviceId)
                              if (
                                (selectedDeviceId == null ||
                                  selectedDeviceId === '') &&
                                (attrListCache == null ||
                                  attrListCache?.length === 0)
                              ) {
                                return
                              } else refetchAttrData()
                              console.log('selectedDeviceId', selectedDeviceId)
                            }}
                          />
                          <SelectDropdown
                            label={t(
                              'cloud:org_manage.event_manage.add_event.condition.attr',
                            )}
                            name={`condition.${index}.attribute_name`}
                            options={
                              attrData
                                ? attrSelectData
                                : [{ label: t('loading:attr'), value: '' }]
                            }
                            isOptionDisabled={option =>
                              option.label === t('loading:attr')
                            }
                            noOptionsMessage={() => t('table:no_attr')}
                            control={control}
                            closeMenuOnSelect
                          />
                          <SelectDropdown
                            label={t(
                              'cloud:org_manage.event_manage.add_event.condition.condition_type.title',
                            )}
                            name={`condition.${index}.condition_type`}
                            options={[
                              {
                                label: t(
                                  'cloud:org_manage.event_manage.add_event.condition.condition_type.normal',
                                ),
                                value: 'normal',
                              },
                              {
                                label: t(
                                  'cloud:org_manage.event_manage.add_event.condition.condition_type.delay',
                                ),
                                value: 'delay',
                              },
                            ]}
                            control={control}
                            closeMenuOnSelect
                          />
                          <SelectDropdown
                            label={t(
                              'cloud:org_manage.event_manage.add_event.condition.operator.title',
                            )}
                            name={`condition.${index}.operator`}
                            options={[
                              {
                                label: t(
                                  'cloud:org_manage.event_manage.add_event.condition.operator.gte',
                                ),
                                value: '>',
                              },
                              {
                                label: t(
                                  'cloud:org_manage.event_manage.add_event.condition.operator.lte',
                                ),
                                value: '<',
                              },
                              {
                                label: t(
                                  'cloud:org_manage.event_manage.add_event.condition.operator.not',
                                ),
                                value: '!=',
                              },
                            ]}
                            control={control}
                            closeMenuOnSelect
                          />
                          <button
                            type="button"
                            onClick={() => conditionRemove(index)}
                          >
                            X
                          </button>
                        </section>
                      </>
                    )
                  })
                : null}
            </>
          )
        }}
      </FormMultipleFields>
    </FormDrawer>
  )
}
