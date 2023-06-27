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
import { useDefaultCombobox } from '~/utils/hooks'
import { useCreateEvent, type CreateEventDTO } from '../../api/eventAPI'
import { useGetGroups } from '../../api/groupAPI'
import { nameSchema, selectOptionSchema } from '~/utils/schemaValidation'
import { useGetDevices } from '../../api/deviceAPI'
import { useGetAttrs } from '../../api/attrAPI'
import { queryClient } from '~/lib/react-query'
import { flattenData } from '~/utils/misc'
import TitleBar from '~/components/Head/TitleBar'

import {
  type ActionType,
  type Condition,
  type DeviceList,
  type Group,
} from '../../types'
import { type Attribute } from '~/types'
import { type OrgList } from '~/layout/MainLayout/types'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'

export const eventConditionSchema = z.array(
  z.object({
    device_id: selectOptionSchema(),
    attribute_name: selectOptionSchema(),
    condition_type: selectOptionSchema(z.enum(['normal', 'delay'] as const)),
    operator: selectOptionSchema(z.enum(['<', '>', '!='] as const)),
    threshold: z.string(),
    logical_operator: selectOptionSchema(z.enum(['and', 'or'] as const)),
  }),
)

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
      z
        .object({
          action_type: selectOptionSchema(
            z.enum(['eventactive', 'delay'] as const),
          ),
          message: z.string().optional(),
        })
        .or(
          z.object({
            action_type: selectOptionSchema(
              z.enum(['sms', 'mqtt', 'fcm', 'event', 'email'] as const),
            ),
            message: z.string(),
          }),
        ),
    ),
  )
  .optional()

export const createEventSchema = z
  .object({
    project_id: z.string().optional(),
    org_id: selectOptionSchema().optional(),
    group_id: selectOptionSchema().optional(),
    name: nameSchema,
    action: eventActionSchema,
    // interval: eventIntervalSchema,
    // status: z.boolean().optional(),
    // retry: z.number().optional(),
  })
  .and(
    z.discriminatedUnion('onClick', [
      z.object({
        onClick: z.literal('true'),
        condition: z.tuple([]),
      }),
      z.object({
        onClick: z.literal('false'),
        condition: eventConditionSchema,
      }),
    ]),
  )

export function CreateEvent() {
  const { t } = useTranslation()

  const [onClickValue, setOnclickValue] = useState(false)

  const projectId = useProjectIdStore(state => state.projectId)
  const { mutate, isLoading, isSuccess } = useCreateEvent()

  const params = useParams()
  const orgId = params.orgId as string

  const { data: groupData, refetch: refetchGroupData } = useGetGroups({
    orgId,
    projectId,
    config: { enabled: false },
  })
  const groupListCache: Group[] | undefined = queryClient.getQueryData(
    ['groups'],
    { exact: false },
  )

  const { data: deviceData, refetch: refetchDeviceData } = useGetDevices({
    orgId,
    projectId,
    config: { enabled: false },
  })
  const deviceListCache: DeviceList | undefined = queryClient.getQueryData(
    ['devices'],
    { exact: false },
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
    { exact: false },
  )
  const attrSelectData = attrData?.attributes.map(attribute => ({
    value: attribute.attribute_key,
    label: attribute.attribute_key,
  })) || [{ value: '', label: '' }]

  const orgListCache: OrgList | undefined = queryClient.getQueryData(['orgs'], {
    exact: false,
  })
  const { acc: orgFlattenData } = flattenData(
    orgListCache?.organizations || [],
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )
  const defaultComboboxOrgData = useDefaultCombobox('org')
  const orgSelectOptions = [defaultComboboxOrgData, ...orgFlattenData]

  return (
    <FormDrawer
      isDone={isSuccess}
      size="xl"
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
      setOtherState={setOnclickValue}
    >
      <FormMultipleFields<CreateEventDTO['data'], typeof createEventSchema>
        id="create-event"
        onSubmit={values => {
          console.log('values: ', values)
          const conditionArr =
            values.condition?.map(item => ({
              device_id: (
                item.device_id as unknown as { value: string; label: string }
              )?.value,
              attribute_name: (
                item.attribute_name as unknown as {
                  value: string
                  label: string
                }
              )?.value,
              condition_type: (
                item.condition_type as unknown as {
                  value: Condition['condition_type']
                  label: string
                }
              )?.value,
              operator: (
                item.operator as unknown as {
                  value: Condition['operator']
                  label: string
                }
              )?.value,
              threshold: item.threshold,
              logical_operator: (
                item.logical_operator as unknown as {
                  value: Condition['logical_operator']
                  label: string
                }
              )?.value,
            })) || []
          const actionArr =
            values.action?.map(item => ({
              action_type: (
                item.action_type as unknown as {
                  value: ActionType
                  label: string
                }
              )?.value,
              receiver: item.receiver,
              message: item.message,
            })) || []

          mutate({
            data: {
              project_id: projectId,
              // @ts-ignore
              org_id:
                (values.org_id as unknown as { value: string; label: string })
                  ?.value || '',
              // @ts-ignore
              group_id:
                (
                  values.group_id as unknown as {
                    value: string
                    label: string
                  }
                )?.value || '',
              name: values.name,
              onClick: values.onClick === 'true',
              condition: values.onClick === 'false' ? conditionArr : null,
              action: values.onClick === 'false' ? actionArr : null,
            },
          })
        }}
        schema={createEventSchema}
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
          console.log('zod errors: ', formState.errors)
          return (
            <>
              <div className="space-y-3">
                <TitleBar
                  title={t(
                    'cloud:org_manage.event_manage.add_event.condition.title',
                  )}
                  className="w-full rounded-md bg-gray-500 pl-3"
                />
                <div className="flex space-x-5">
                  <InputField
                    label={t('cloud:org_manage.event_manage.add_event.name')}
                    error={formState.errors['name']}
                    registration={register('name')}
                  />
                  <div className="space-y-1">
                    <SelectDropdown
                      label={t(
                        'cloud:org_manage.device_manage.add_device.parent',
                      )}
                      name="org_id"
                      control={control}
                      options={
                        orgSelectOptions?.map(org => ({
                          label: org?.name,
                          value: org?.id,
                        })) || [{ label: t('loading:org'), value: '' }]
                      }
                    />
                    <p className="text-body-sm text-primary-400">
                      {formState?.errors?.org_id?.message}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <SelectDropdown
                      label={t('cloud:org_manage.event_manage.add_event.group')}
                      name="group_id"
                      control={control}
                      options={
                        groupData?.groups.map(group => ({
                          label: group?.name,
                          value: group?.id,
                        })) || [{ label: t('loading:group'), value: '' }]
                      }
                      isOptionDisabled={option =>
                        option.label === t('loading:group')
                      }
                      noOptionsMessage={() => t('table:no_group')}
                      onMenuOpen={() => {
                        if (groupListCache) {
                          return
                        } else refetchGroupData()
                      }}
                    />
                    <p className="text-body-sm text-primary-400">
                      {formState?.errors?.org_id?.message}
                    </p>
                  </div>
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
                </div>
              </div>
              {!onClickValue ? (
                <div className="flex justify-between space-x-3">
                  <TitleBar
                    title={t(
                      'cloud:org_manage.event_manage.add_event.condition.title',
                    )}
                    className="w-full rounded-md bg-gray-500 pl-3"
                  />
                  <Button
                    className="rounded-md"
                    variant="trans"
                    size="square"
                    startIcon={
                      <PlusIcon width={16} height={16} viewBox="0 0 16 16" />
                    }
                    onClick={() => conditionAppend()}
                  />
                </div>
              ) : null}
              {!onClickValue
                ? conditionFields.map((field, index) => {
                    return (
                      <section
                        className="space-y-2"
                        style={{ marginTop: '10px' }}
                        key={field.id}
                      >
                        <div className="flex justify-between gap-x-3">
                          <div className="space-y-1">
                            <SelectDropdown
                              label={t(
                                'cloud:org_manage.event_manage.add_event.condition.device',
                              )}
                              name={`condition.${index}.device_id`}
                              control={control}
                              options={
                                deviceData
                                  ? deviceSelectData
                                  : [{ label: t('loading:device'), value: '' }]
                              }
                              isOptionDisabled={option =>
                                option.label === t('loading:device')
                              }
                              noOptionsMessage={() => t('table:no_device')}
                              onMenuOpen={() => {
                                if (deviceListCache?.devices) {
                                  return
                                } else refetchDeviceData()
                              }}
                              onMenuClose={() => {
                                const deviceId = watch(
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
                              }}
                            />
                            <p className="text-body-sm text-primary-400">
                              {
                                formState?.errors?.condition?.[index]?.device_id
                                  ?.message
                              }
                            </p>
                          </div>
                          <div className="space-y-1">
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
                            />
                            <p className="text-body-sm text-primary-400">
                              {
                                formState?.errors?.condition?.[index]
                                  ?.attribute_name?.message
                              }
                            </p>
                          </div>
                          <div className="space-y-1">
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
                            />
                            <p className="text-body-sm text-primary-400">
                              {
                                formState?.errors?.condition?.[index]
                                  ?.condition_type?.message
                              }
                            </p>
                          </div>
                          <div className="space-y-1">
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
                            />
                            <p className="text-body-sm text-primary-400">
                              {
                                formState?.errors?.condition?.[index]?.operator
                                  ?.message
                              }
                            </p>
                          </div>
                          <InputField
                            label={t(
                              'cloud:org_manage.event_manage.add_event.condition.threshold',
                            )}
                            registration={register(
                              `condition.${index}.threshold`,
                            )}
                            type="number"
                          />
                        </div>
                        <div className="flex justify-end">
                          <SelectDropdown
                            label={t(
                              'cloud:org_manage.event_manage.add_event.condition.logical_operator.title',
                            )}
                            name={`condition.${index}.logical_operator`}
                            options={[
                              {
                                label: t(
                                  'cloud:org_manage.event_manage.add_event.condition.logical_operator.and',
                                ),
                                value: 'and',
                              },
                              {
                                label: t(
                                  'cloud:org_manage.event_manage.add_event.condition.logical_operator.or',
                                ),
                                value: 'or',
                              },
                            ]}
                            control={control}
                          />
                          <Button
                            type="button"
                            size="square"
                            variant="trans"
                            className="ml-5 mt-3 border-none"
                            onClick={() => conditionRemove(index)}
                            startIcon={
                              <img
                                src={btnDeleteIcon}
                                alt="Delete condition"
                                className="h-10 w-10"
                              />
                            }
                          />
                        </div>
                      </section>
                    )
                  })
                : null}

              {!onClickValue ? (
                <div className="flex justify-between space-x-3">
                  <TitleBar
                    title={t(
                      'cloud:org_manage.event_manage.add_event.action.title',
                    )}
                    className="w-full rounded-md bg-gray-500 pl-3"
                  />
                  <Button
                    className="rounded-md"
                    variant="trans"
                    size="square"
                    startIcon={
                      <PlusIcon width={16} height={16} viewBox="0 0 16 16" />
                    }
                    onClick={() => actionAppend()}
                  />
                </div>
              ) : null}
              {!onClickValue
                ? actionFields.map((field, index) => {
                    return (
                      <section
                        className="space-y-2"
                        style={{ marginTop: '10px' }}
                        key={field.id}
                      >
                        <div className="flex justify-between gap-x-3">
                          <div className="space-y-1">
                            <SelectDropdown
                              label={t(
                                'cloud:org_manage.event_manage.add_event.action.action_type.title',
                              )}
                              name={`action.${index}.action_type`}
                              options={[
                                {
                                  label: t(
                                    'cloud:org_manage.event_manage.add_event.action.action_type.sms',
                                  ),
                                  value: 'sms',
                                },
                                {
                                  label: t(
                                    'cloud:org_manage.event_manage.add_event.action.action_type.email',
                                  ),
                                  value: 'email',
                                },
                                {
                                  label: t(
                                    'cloud:org_manage.event_manage.add_event.action.action_type.mqtt',
                                  ),
                                  value: 'mqtt',
                                },
                                {
                                  label: t(
                                    'cloud:org_manage.event_manage.add_event.action.action_type.fcm',
                                  ),
                                  value: 'fcm',
                                },
                                {
                                  label: t(
                                    'cloud:org_manage.event_manage.add_event.action.action_type.event',
                                  ),
                                  value: 'event',
                                },
                                {
                                  label: t(
                                    'cloud:org_manage.event_manage.add_event.action.action_type.eventactive',
                                  ),
                                  value: 'eventactive',
                                },
                                {
                                  label: t(
                                    'cloud:org_manage.event_manage.add_event.action.action_type.delay',
                                  ),
                                  value: 'delay',
                                },
                              ]}
                              control={control}
                            />
                            <p className="text-body-sm text-primary-400">
                              {
                                formState?.errors?.action?.[index]?.action_type
                                  ?.message
                              }
                            </p>
                          </div>
                          <div className="space-y-1">
                            <InputField
                              label={t(
                                'cloud:org_manage.event_manage.add_event.action.receiver',
                              )}
                              registration={register(
                                `action.${index}.receiver`,
                              )}
                            />
                            <p className="text-body-sm text-primary-400">
                              {
                                formState?.errors?.action?.[index]?.receiver
                                  ?.message
                              }
                            </p>
                          </div>
                          <div className="space-y-1">
                            <InputField
                              label={t(
                                'cloud:org_manage.event_manage.add_event.action.message',
                              )}
                              registration={register(`action.${index}.message`)}
                            />
                            <p className="text-body-sm text-primary-400">
                              {
                                formState?.errors?.action?.[index]?.message
                                  ?.message
                              }
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="square"
                            variant="trans"
                            className="border-none"
                            onClick={() => actionRemove(index)}
                            startIcon={
                              <img
                                src={btnDeleteIcon}
                                alt="Delete action"
                                className="h-10 w-10"
                              />
                            }
                          />
                        </div>
                      </section>
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
