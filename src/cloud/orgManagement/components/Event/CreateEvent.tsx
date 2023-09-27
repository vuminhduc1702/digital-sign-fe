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
  type SelectOption,
} from '~/components/Form'
import { useDefaultCombobox } from '~/utils/hooks'
import { useCreateEvent, type CreateEventDTO } from '../../api/eventAPI'
import { useGetGroups } from '../../api/groupAPI'
import { nameSchema, selectOptionSchema } from '~/utils/schemaValidation'
import { useGetDevices } from '../../api/deviceAPI'
import { useGetAttrs } from '../../api/attrAPI'
import { queryClient } from '~/lib/react-query'
import { cn, flattenData } from '~/utils/misc'
import TitleBar from '~/components/Head/TitleBar'
import storage from '~/utils/storage'

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
          subject: z.string(),
        })
        .or(
          z.object({
            action_type: selectOptionSchema(
              z.enum(['sms', 'mqtt', 'fcm', 'event', 'email'] as const),
            ),
            message: z.string(),
            subject: z.string(),
          }),
        ),
    ),
  )
  .optional()

export const createEventSchema = z
  .object({
    project_id: z.string().optional(),
    // org_id: selectOptionSchema().optional(),
    // group_id: selectOptionSchema().optional(),
    name: nameSchema,
    action: eventActionSchema,
    // interval: eventIntervalSchema,
    status: z.string(),
    retry: z.string(),
    onClick: z.string(),
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

export interface IntervalData {
  [key: string]: boolean
}

export function CreateEvent() {
  const { t } = useTranslation()

  const [onClickValue, setOnclickValue] = useState('false')
  const [typeEvent, setTypeEvent] = useState('schedule')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [orgValue, setOrgValue] = useState<SelectOption | null>()
  const [groupValue, setGroupValue] = useState<SelectOption | null>()

  const { id: projectId } = storage.getProject()
  const { mutate, isLoading, isSuccess } = useCreateEvent()

  const params = useParams()
  const orgId = params.orgId as string

  const { data: groupData, refetch: refetchGroupData } = useGetGroups({
    orgId,
    projectId,
    entity_type: 'EVENT',
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
    config: {
      enabled: !!selectedDeviceId,
      suspense: false,
    },
  })
  const attrListCache: Attribute[] | undefined = queryClient.getQueryData(
    ['attrs'],
    { exact: false },
  )
  const attrSelectData = attrData?.attributes.map(attribute => ({
    value: attribute.attribute_key,
    label: attribute.attribute_key,
  })) || [{ value: '', label: t('loading:attr') }]

  const orgListCache: OrgList | undefined = queryClient.getQueryData(['orgs'], {
    exact: false,
  })
  const { acc: orgFlattenData } = flattenData(
    orgListCache?.organizations,
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )

  const [todos, setTodos] = useState([
    { id: '1', name: 'Thứ Hai', selected: false, value: 'monday' },
    { id: '2', name: 'Thứ Ba', selected: false, value: 'tuesday' },
    { id: '3', name: 'Thứ Tư', selected: false, value: 'wednesday' },
    { id: '4', name: 'Thứ Năm', selected: false, value: 'thursday' },
    { id: '5', name: 'Thứ Sáu', selected: false, value: 'friday' },
    { id: '6', name: 'Thứ Bảy', selected: false, value: 'saturday' },
    { id: '7', name: 'Chủ Nhật', selected: false, value: 'sunday' },
  ])

  const clearData = () => {
    setTodos([
      { id: '1', name: 'Thứ Hai', selected: false, value: 'monday' },
      { id: '2', name: 'Thứ Ba', selected: false, value: 'tuesday' },
      { id: '3', name: 'Thứ Tư', selected: false, value: 'wednesday' },
      { id: '4', name: 'Thứ Năm', selected: false, value: 'thursday' },
      { id: '5', name: 'Thứ Sáu', selected: false, value: 'friday' },
      { id: '6', name: 'Thứ Bảy', selected: false, value: 'saturday' },
      { id: '7', name: 'Chủ Nhật', selected: false, value: 'sunday' },
    ])
    setOrgValue(null)
    setGroupValue(null)
  }

  const todoClicked = (e: any) => {
    setTodos(
      todos.map(todo =>
        todo.id === e.target.getAttribute('data-id')
          ? { ...todo, selected: !todo.selected }
          : todo,
      ),
    )
  }

  return (
    <FormDrawer
      isDone={isSuccess}
      size="lg"
      resetData={clearData}
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
      // otherState={onClickValue}
      // setOtherState={setOnclickValue}
    >
      <FormMultipleFields<CreateEventDTO['data'], typeof createEventSchema>
        id="create-event"
        options={{
          defaultValues: { onClick: 'false' },
        }}
        onSubmit={values => {
          const dataFilter = todos.filter(item => item.selected)
          let repeat = ''
          dataFilter.map(item => {
            repeat = repeat + item.value + ','
          })
          const scheduleValue = {
            time: startTime,
            repeat,
          }
          const intervalDay: IntervalData = {}
          dataFilter.map(item => {
            intervalDay[item.value] = item.selected
          })
          const interval = {
            ...intervalDay,
            start_time: startTime,
            end_time: endTime,
          }
          const conditionArr =
            values.condition?.map(item => ({
              device_id: (
                item.device_id as unknown as { value: string; label: string }
              )?.value,
              device_name: (
                item.device_id as unknown as { value: string; label: string }
              )?.label,
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
              subject: item.subject,
            })) || []

          mutate({
            data: {
              project_id: projectId,
              org_id: orgValue?.value || '',
              group_id: groupValue?.value || '',
              name: values.name,
              onClick:
                typeEvent === 'event' ? values.onClick === 'true' : false,
              condition: values.onClick === 'false' ? conditionArr : [],
              action: actionArr,
              status: values.status === 'true',
              retry: values.retry ? parseInt(values.retry) : null,
              schedule: scheduleValue,
              interval,
              type: typeEvent,
            },
          })
        }}
        schema={createEventSchema}
        name={['condition', 'action']}
      >
        {(
          { register, formState, control, watch, setValue },
          {
            append: conditionAppend,
            fields: conditionFields,
            remove: conditionRemove,
          },
          { append: actionAppend, fields: actionFields, remove: actionRemove },
        ) => {
          return (
            <>
              <div className="space-y-3">
                <TitleBar
                  title={t('cloud:org_manage.event_manage.add_event.info')}
                  className="w-full rounded-md bg-gray-500 pl-3"
                />
                <div className="grid grid-cols-1 gap-x-4 md:grid-cols-4">
                  <InputField
                    label={t('cloud:org_manage.event_manage.add_event.name')}
                    error={formState.errors['name']}
                    registration={register('name')}
                  />
                  <div className="space-y-1">
                    <SelectDropdown
                      isClearable={true}
                      label={t(
                        'cloud:org_manage.device_manage.add_device.parent',
                      )}
                      name="org_id"
                      control={control}
                      options={
                        orgFlattenData?.map(org => ({
                          label: org?.name,
                          value: org?.id,
                        })) || [{ label: t('loading:org'), value: '' }]
                      }
                      value={orgValue}
                      onChange={e => setOrgValue(e)}
                    />
                    {/* <p className="text-body-sm text-primary-400">
                      {formState?.errors?.org_id?.message}
                    </p> */}
                  </div>
                  <div className="space-y-1">
                    <SelectDropdown
                      isClearable={true}
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
                      value={groupValue}
                      onChange={e => setGroupValue(e)}
                    />
                    {/* <p className="text-body-sm text-primary-400">
                      {formState?.errors?.org_id?.message}
                    </p> */}
                  </div>
                  <SelectField
                    label={t('cloud:org_manage.event_manage.add_event.status')}
                    // error={formState.errors['type']}
                    registration={register('status')}
                    options={[
                      { value: true, label: 'Kích hoạt' },
                      { value: false, label: 'Không kích hoạt' },
                    ]}
                  />
                  <SelectField
                    label={t(
                      'cloud:org_manage.event_manage.add_event.condition.onClick',
                    )}
                    error={formState.errors['onClick']}
                    registration={register('onClick')}
                    disabled={typeEvent === 'schedule'}
                    options={[
                      { value: true, label: 'Có' },
                      { value: false, label: 'Không' },
                    ]}
                    onChange={event => setOnclickValue(event.target.value)}
                  />
                  <SelectField
                    label={t(
                      'cloud:org_manage.event_manage.add_event.type_event',
                    )}
                    // error={formState.errors['type']}
                    // registration={register('onClick')}
                    options={[
                      { value: 'schedule', label: 'Lập lịch schedule' },
                      { value: 'event', label: 'Lập lịch event' },
                    ]}
                    onChange={event => setTypeEvent(event.target.value)}
                  />
                  <InputField
                    label={t('cloud:org_manage.event_manage.add_event.retry')}
                    registration={register('retry')}
                    type="number"
                  />
                </div>
              </div>
              <div>
                <TitleBar
                  title={t(
                    'cloud:org_manage.event_manage.add_event.test_condition_time',
                  )}
                  className="w-full rounded-md bg-gray-500 pl-3"
                />
                <div className="grid grid-cols-1 gap-x-4 md:grid-cols-4">
                  {todos.map(todo => (
                    <div
                      onClick={todoClicked}
                      data-id={todo.id}
                      key={todo.id}
                      className={cn(
                        'mt-5 cursor-pointer rounded-lg bg-stone-300 py-3 text-center text-white',
                        { 'bg-primary-400': todo.selected },
                      )}
                    >
                      {todo.name}
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid grid-cols-1 gap-x-4 md:grid-cols-2">
                  <div className="relative w-full">
                    <p className="mb-2 text-center">
                      {t('cloud:org_manage.event_manage.add_event.start')}
                    </p>
                    <input
                      name="startTime"
                      onChange={e => setStartTime(e.target.value)}
                      className="w-full rounded border border-solid border-slate-300 px-4 py-2"
                      type="time"
                    />
                  </div>
                  <div className="relative w-full">
                    <p className="mb-2 text-center">
                      {t('cloud:org_manage.event_manage.add_event.end')}
                    </p>
                    <input
                      name="endTime"
                      onChange={e => setEndTime(e.target.value)}
                      className="w-full rounded border border-solid border-slate-300 px-4 py-2"
                      type="time"
                    />
                  </div>
                </div>
              </div>
              {onClickValue === 'false' && typeEvent === 'event' ? (
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
              {onClickValue === 'false' && typeEvent === 'event'
                ? conditionFields.map((field, index) => {
                    return (
                      <section
                        className="space-y-2"
                        style={{ marginTop: '10px' }}
                        key={field.id}
                      >
                        <div className="grid grid-cols-1 gap-x-4 md:grid-cols-3">
                          <div className="space-y-1">
                            <SelectDropdown
                              isClearable={true}
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
                              onChange={e => {
                                setSelectedDeviceId(e?.value)
                                setValue(`condition.${index}.device_id`, e)
                              }}
                              // onMenuClose={() => {
                              //   const deviceId = watch(
                              //     'condition.0.device_id.value',
                              //   ) as unknown as string
                              //   setSelectedDeviceId(deviceId)
                              //   if (
                              //     (selectedDeviceId == null ||
                              //       selectedDeviceId === '') &&
                              //     (attrListCache == null ||
                              //       attrListCache?.length === 0)
                              //   ) {
                              //     return
                              //   } else refetchAttrData()
                              // }}
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
                              isClearable={true}
                              label={t(
                                'cloud:org_manage.event_manage.add_event.condition.attr',
                              )}
                              name={`condition.${index}.attribute_name`}
                              options={attrSelectData}
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
                              isClearable={true}
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
                              isClearable={true}
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
                          <div className="flex justify-end">
                            <SelectDropdown
                              isClearable={true}
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
                        </div>
                      </section>
                    )
                  })
                : null}

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
              {actionFields.map((field, index) => {
                return (
                  <section
                    className="space-y-2"
                    style={{ marginTop: '10px' }}
                    key={field.id}
                  >
                    <div className="grid grid-cols-1 gap-x-4 md:grid-cols-4">
                      <div className="space-y-1">
                        <SelectDropdown
                          isClearable={true}
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
                            'cloud:org_manage.event_manage.add_event.action.address',
                          )}
                          registration={register(`action.${index}.receiver`)}
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
                            'cloud:org_manage.event_manage.add_event.action.subject',
                          )}
                          registration={register(`action.${index}.subject`)}
                        />
                        <p className="text-body-sm text-primary-400">
                          {formState?.errors?.action?.[index]?.subject?.message}
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <InputField
                          label={t(
                            'cloud:org_manage.event_manage.add_event.action.message',
                          )}
                          registration={register(`action.${index}.message`)}
                        />
                        <p className="text-body-sm text-primary-400">
                          {formState?.errors?.action?.[index]?.message?.message}
                        </p>
                        <Button
                          type="button"
                          size="square"
                          variant="trans"
                          className="ml-5 mt-3 border-none"
                          onClick={() => actionRemove(index)}
                          startIcon={
                            <img
                              src={btnDeleteIcon}
                              alt="Delete condition"
                              className="h-10 w-10"
                            />
                          }
                        />
                      </div>
                    </div>
                  </section>
                )
              })}
            </>
          )
        }}
      </FormMultipleFields>
    </FormDrawer>
  )
}
