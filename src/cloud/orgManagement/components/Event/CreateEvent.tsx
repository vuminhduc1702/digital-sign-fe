import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'

import { useGetOrgs } from '~/layout/MainLayout/api'
import { Button } from '~/components/Button'
import {
  FormDrawer,
  InputField,
  SelectField,
  SelectDropdown,
  FieldWrapper,
} from '~/components/Form'
import { useCreateEvent, type CreateEventDTO } from '../../api/eventAPI'
import { useGetGroups } from '../../api/groupAPI'
import { useGetDevices } from '../../api/deviceAPI'
import { cn, flattenData } from '~/utils/misc'
import TitleBar from '~/components/Head/TitleBar'
import storage from '~/utils/storage'
import { Checkbox } from '~/components/Checkbox'
import i18n from '~/i18n'
import { useCreateAttrChart } from '~/cloud/dashboard/api'

import { nameSchema } from '~/utils/schemaValidation'
import { initialTodos } from './EventTable'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'

export const logicalOperatorOption = [
  {
    label: i18n.t(
      'cloud:org_manage.event_manage.add_event.condition.logical_operator.and',
    ),
    value: 'and',
  },
  {
    label: i18n.t(
      'cloud:org_manage.event_manage.add_event.condition.logical_operator.or',
    ),
    value: 'or',
  },
]

export const operatorOptions = [
  {
    label: i18n.t(
      'cloud:org_manage.event_manage.add_event.condition.operator.gte',
    ),
    value: '>',
  },
  {
    label: i18n.t(
      'cloud:org_manage.event_manage.add_event.condition.operator.lte',
    ),
    value: '<',
  },
  {
    label: i18n.t(
      'cloud:org_manage.event_manage.add_event.condition.operator.not',
    ),
    value: '!=',
  },
]

export const conditionTypeOptions = [
  {
    label: i18n.t(
      'cloud:org_manage.event_manage.add_event.condition.condition_type.normal',
    ),
    value: 'normal',
  },
  {
    label: i18n.t(
      'cloud:org_manage.event_manage.add_event.condition.condition_type.delay',
    ),
    value: 'delay',
  },
]

export const actionTypeOptions = [
  {
    label: i18n.t(
      'cloud:org_manage.event_manage.add_event.action.action_type.sms',
    ),
    value: 'sms',
  },
  {
    label: i18n.t(
      'cloud:org_manage.event_manage.add_event.action.action_type.email',
    ),
    value: 'email',
  },
  {
    label: i18n.t(
      'cloud:org_manage.event_manage.add_event.action.action_type.mqtt',
    ),
    value: 'mqtt',
  },
  {
    label: i18n.t(
      'cloud:org_manage.event_manage.add_event.action.action_type.fcm',
    ),
    value: 'fcm',
  },
  {
    label: i18n.t(
      'cloud:org_manage.event_manage.add_event.action.action_type.event',
    ),
    value: 'event',
  },
  {
    label: i18n.t(
      'cloud:org_manage.event_manage.add_event.action.action_type.eventactive',
    ),
    value: 'eventactive',
  },
  {
    label: i18n.t(
      'cloud:org_manage.event_manage.add_event.action.action_type.delay',
    ),
    value: 'delay',
  },
]

const eventConditionSchema = z.array(
  z.object({
    device_id: z.string({
      required_error: i18n.t(
        'cloud:org_manage.device_manage.add_device.choose_device',
      ),
    }),
    attribute_name: z.string({
      required_error: i18n.t(
        'cloud:org_manage.org_manage.add_attr.choose_attr',
      ),
    }),
    condition_type: z.enum(['normal', 'delay'] as const),
    operator: z.enum(['<', '>', '!='] as const),
    threshold: z.string(),
    logical_operator: z.enum(['and', 'or'] as const),
  }),
)

const eventIntervalSchema = z.object({
  monday: z.boolean().optional(),
  tuesday: z.boolean().optional(),
  wednesday: z.boolean().optional(),
  thursday: z.boolean().optional(),
  friday: z.boolean().optional(),
  saturday: z.boolean().optional(),
  sunday: z.boolean().optional(),
  start_time: z
    .string()
    .min(1, { message: i18n.t('ws:filter.choose_startTime') }),
  end_time: z.string().min(1, { message: i18n.t('ws:filter.choose_endTime') }),
})

const eventActionSchema = z
  .array(
    z.object({ receiver: z.string() }).and(
      z
        .object({
          action_type: z.enum(['eventactive', 'delay'] as const),
          message: z.string().optional(),
          subject: z.string(),
        })
        .or(
          z.object({
            action_type: z.enum([
              'sms',
              'mqtt',
              'fcm',
              'event',
              'email',
            ] as const),
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
    org_id: z.string().optional(),
    group_id: z.string().optional(),
    name: nameSchema,
    action: eventActionSchema,
    interval: eventIntervalSchema,
    status: z.boolean().optional(),
    retry: z.number(),
    onClick: z.boolean(),
  })
  .and(
    z.discriminatedUnion('onClick', [
      z.object({
        onClick: z.literal(true),
        condition: z.tuple([]),
      }),
      z.object({
        onClick: z.literal(false),
        condition: eventConditionSchema,
      }),
    ]),
  )

export interface IntervalData {
  [key: string]: boolean
}

export function CreateEvent() {
  const { t } = useTranslation()

  const {
    register,
    formState,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    reset,
  } = useForm<CreateEventDTO['data']>({
    resolver: createEventSchema && zodResolver(createEventSchema),
    defaultValues: {
      onClick: false,
      status: true,
      action: [{}],
      condition: [{}],
    },
  })
  const {
    append: conditionAppend,
    fields: conditionFields,
    remove: conditionRemove,
  } = useFieldArray({
    name: 'condition',
    control,
  })
  const {
    append: actionAppend,
    fields: actionFields,
    remove: actionRemove,
  } = useFieldArray({
    name: 'action',
    control,
  })
  console.log('formState.errors', formState.errors)

  const { id: projectId } = storage.getProject()
  const { mutate, isLoading, isSuccess } = useCreateEvent()

  const { data: orgData } = useGetOrgs({ projectId })
  const { acc: orgFlattenData } = flattenData(
    orgData?.organizations,
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )
  const orgSelectOptions = orgFlattenData?.map(org => ({
    label: org?.name,
    value: org?.id,
  }))

  const { data: groupData } = useGetGroups({
    orgId: watch('org_id'),
    projectId,
    entity_type: 'EVENT',
    config: { suspense: false },
  })
  const groupSelectOptions = groupData?.groups?.map(group => ({
    label: group?.name,
    value: group?.id,
  }))

  const { data: deviceData, isLoading: deviceIsLoading } = useGetDevices({
    orgId: watch('org_id'),
    projectId,
    config: { suspense: false },
  })
  const deviceSelectData = deviceData?.devices.map(device => ({
    value: device.id,
    label: device.name,
  }))

  const {
    data: attrData,
    mutate: attrMutate,
    isLoading: attrIsLoading,
  } = useCreateAttrChart()
  const attrSelectData = attrData?.keys?.map(item => ({
    value: item,
    label: item,
  }))

  const [todos, setTodos] = useState(initialTodos)

  const clearData = () => {
    reset()
    setTodos(initialTodos)
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
    >
      <form
        id="create-event"
        className="w-full space-y-5"
        onSubmit={handleSubmit(values => {
          const dataFilter = todos.filter(item => item.selected)
          let repeat = ''
          dataFilter.map(item => {
            repeat = repeat + item.value + ','
          })
          const scheduleValue = {
            time: getValues('interval.start_time'),
            repeat,
          }
          const intervalDay: IntervalData = {}
          dataFilter.map(item => {
            intervalDay[item.value] = item.selected
          })
          const interval = {
            ...intervalDay,
            start_time: getValues('interval.start_time'),
            end_time: getValues('interval.end_time'),
          }
          const conditionArr = values.condition?.map(item => ({
            device_id: item.device_id,
            attribute_name: item.attribute_name,
            condition_type: item.condition_type,
            operator: item.operator,
            threshold: item.threshold,
            logical_operator: item.logical_operator,
          }))
          const actionArr = values.action?.map(item => ({
            action_type: item.action_type,
            receiver: item.receiver,
            message: item.message,
            subject: item.subject,
          }))

          mutate({
            data: {
              project_id: projectId,
              org_id: values.org_id,
              group_id: values.group_id,
              name: values.name,
              onClick:
                getValues('type') === 'event' ? values.onClick === true : false,
              condition: values.onClick === false ? conditionArr : [],
              action: actionArr,
              status: values.status === true,
              retry: values.retry,
              schedule: scheduleValue,
              interval,
              type: getValues('type'),
            },
          })
        })}
      >
        <>
          <div className="space-y-3">
            <TitleBar
              title={t('cloud:org_manage.event_manage.add_event.info')}
              className="w-full rounded-md bg-secondary-700 pl-3"
            />
            <div className="grid grid-cols-1 gap-x-4 md:grid-cols-4">
              <InputField
                label={t('cloud:org_manage.event_manage.add_event.name')}
                error={formState.errors['name']}
                registration={register('name')}
              />
              <div className="space-y-1">
                <SelectDropdown
                  label={t('cloud:org_manage.device_manage.add_device.parent')}
                  name="org_id"
                  control={control}
                  options={
                    orgData
                      ? orgSelectOptions
                      : [{ label: t('loading:org'), value: '' }]
                  }
                  isOptionDisabled={option => option.label === t('loading:org')}
                  noOptionsMessage={() => t('table:no_org')}
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
                    groupData
                      ? groupSelectOptions
                      : [{ label: t('loading:group'), value: '' }]
                  }
                  isOptionDisabled={option =>
                    option.label === t('loading:group')
                  }
                  noOptionsMessage={() => t('table:no_group')}
                />
                <p className="text-body-sm text-primary-400">
                  {formState?.errors?.group_id?.message}
                </p>
              </div>
              <FieldWrapper
                label={t('cloud:org_manage.event_manage.add_event.status')}
                error={formState?.errors['status']}
              >
                <Controller
                  control={control}
                  name={'status'}
                  render={({ field: { onChange, value, ...field } }) => {
                    return (
                      <Checkbox
                        {...field}
                        checked={value}
                        onCheckedChange={onChange}
                      />
                    )
                  }}
                />
              </FieldWrapper>
              <FieldWrapper
                label={t(
                  'cloud:org_manage.event_manage.add_event.condition.onClick',
                )}
                error={formState?.errors['onClick']}
              >
                <Controller
                  control={control}
                  name={'onClick'}
                  render={({ field: { onChange, value, ...field } }) => {
                    return (
                      <Checkbox
                        {...field}
                        checked={value}
                        onCheckedChange={onChange}
                        disabled={getValues('type') === 'schedule'}
                      />
                    )
                  }}
                />
              </FieldWrapper>
              <SelectField
                label={t('cloud:org_manage.event_manage.add_event.type_event')}
                error={formState.errors['type']}
                registration={register('type')}
                options={[
                  {
                    value: 'schedule',
                    label: t(
                      'cloud:org_manage.event_manage.add_event.schedule_type',
                    ),
                  },
                  {
                    value: 'event',
                    label: t(
                      'cloud:org_manage.event_manage.add_event.event_type',
                    ),
                  },
                ]}
              />
              <InputField
                label={t('cloud:org_manage.event_manage.add_event.retry')}
                registration={register('retry', {
                  valueAsNumber: true,
                })}
                type="number"
              />
            </div>
          </div>
          <div>
            <TitleBar
              title={t(
                'cloud:org_manage.event_manage.add_event.test_condition_time',
              )}
              className="w-full rounded-md bg-secondary-700 pl-3"
            />
            <div className="grid grid-cols-1 gap-x-4 md:grid-cols-4">
              {todos.map(todo => (
                <div
                  onClick={e => {
                    const todoInterval = todos.map(todo =>
                      todo.id === e.target.getAttribute('data-id')
                        ? { ...todo, selected: !todo.selected }
                        : todo,
                    )
                    const dataFilter = todoInterval.filter(
                      item => item.selected,
                    )
                    let repeat = ''
                    dataFilter.map(item => {
                      repeat = repeat + item.value + ','
                    })
                    const intervalDay: IntervalData = {}
                    dataFilter.map(item => {
                      intervalDay[item.value] = item.selected
                    })
                    const interval = {
                      ...intervalDay,
                      start_time: getValues('interval.start_time'),
                      end_time: getValues('interval.end_time'),
                    }
                    setValue('interval', interval)
                    todoClicked(e)
                  }}
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
              <InputField
                type="time"
                label={t('cloud:org_manage.event_manage.add_event.start')}
                error={formState?.errors?.interval?.start_time}
                registration={register('interval.start_time')}
              />
              <InputField
                type="time"
                label={t('cloud:org_manage.event_manage.add_event.end')}
                error={formState?.errors?.interval?.end_time}
                registration={register('interval.end_time')}
              />
            </div>
          </div>
          {!watch('onClick') && watch('type') === 'event' ? (
            <div className="flex justify-between space-x-3">
              <TitleBar
                title={t(
                  'cloud:org_manage.event_manage.add_event.condition.title',
                )}
                className="w-full rounded-md bg-secondary-700 pl-3"
              />
              <Button
                className="rounded-md"
                variant="trans"
                size="square"
                startIcon={
                  <PlusIcon width={16} height={16} viewBox="0 0 16 16" />
                }
                onClick={() => conditionAppend([{}])}
              />
            </div>
          ) : null}
          {!watch('onClick') && watch('type') === 'event'
            ? conditionFields.map((field, index) => {
                return (
                  <section className="!mt-3 space-y-2" key={field.id}>
                    <div className="grid grid-cols-1 gap-x-4 md:grid-cols-3">
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
                          isLoading={deviceIsLoading}
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
                          isLoading={attrIsLoading}
                          onMenuOpen={() => {
                            attrMutate({
                              data: {
                                entity_ids: [
                                  watch(`condition.${index}.device_id`),
                                ],

                                entity_type: 'DEVICE',
                              },
                            })
                          }}
                        />
                        <p className="text-body-sm text-primary-400">
                          {
                            formState?.errors?.condition?.[index]
                              ?.attribute_name?.message
                          }
                        </p>
                      </div>
                      <SelectField
                        label={t(
                          'cloud:org_manage.event_manage.add_event.condition.condition_type.title',
                        )}
                        error={
                          formState?.errors?.condition?.[index]?.condition_type
                        }
                        registration={register(
                          `condition.${index}.condition_type`,
                        )}
                        options={conditionTypeOptions}
                      />
                      <SelectField
                        label={t(
                          'cloud:org_manage.event_manage.add_event.condition.operator.title',
                        )}
                        error={formState?.errors?.condition?.[index]?.operator}
                        registration={register(`condition.${index}.operator`)}
                        options={operatorOptions}
                      />
                      <InputField
                        label={t(
                          'cloud:org_manage.event_manage.add_event.condition.threshold',
                        )}
                        registration={register(`condition.${index}.threshold`)}
                        type="number"
                      />
                      <div className="flex justify-end">
                        <SelectField
                          label={t(
                            'cloud:org_manage.event_manage.add_event.condition.logical_operator.title',
                          )}
                          error={
                            formState?.errors?.condition?.[index]
                              ?.logical_operator
                          }
                          registration={register(
                            `condition.${index}.logical_operator`,
                          )}
                          options={logicalOperatorOption}
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
              title={t('cloud:org_manage.event_manage.add_event.action.title')}
              className="w-full rounded-md bg-secondary-700 pl-3"
            />
            <Button
              className="rounded-md"
              variant="trans"
              size="square"
              startIcon={
                <PlusIcon width={16} height={16} viewBox="0 0 16 16" />
              }
              onClick={() => actionAppend([{}])}
            />
          </div>
          {actionFields.map((field, index) => {
            return (
              <section className="!mt-3 space-y-2" key={field.id}>
                <div className="grid grid-cols-1 gap-x-4 md:grid-cols-4">
                  <SelectField
                    label={t(
                      'cloud:org_manage.event_manage.add_event.action.action_type.title',
                    )}
                    error={formState?.errors?.action?.[index]?.action_type}
                    registration={register(`action.${index}.action_type`)}
                    options={actionTypeOptions}
                  />
                  <div className="space-y-1">
                    <InputField
                      label={t(
                        'cloud:org_manage.event_manage.add_event.action.address',
                      )}
                      registration={register(`action.${index}.receiver`)}
                    />
                    <p className="text-body-sm text-primary-400">
                      {formState?.errors?.action?.[index]?.receiver?.message}
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
      </form>
    </FormDrawer>
  )
}
