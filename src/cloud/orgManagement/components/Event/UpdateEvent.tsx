import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateAttrChart } from '~/cloud/dashboard/api'
import { useSpinDelay } from 'spin-delay'
import { useParams } from 'react-router-dom'

import { Button } from '~/components/Button'
import {
  FieldWrapper,
  InputField,
  SelectDropdown,
  SelectField,
} from '~/components/Form'
import TitleBar from '~/components/Head/TitleBar'
import { cn, flattenData } from '~/utils/misc'
import storage from '~/utils/storage'
import { useGetDevices } from '../../api/deviceAPI'
import { useGetGroups } from '../../api/groupAPI'
import { Drawer } from '~/components/Drawer'
import {
  useUpdateEvent,
  type UpdateEventDTO,
} from '../../api/eventAPI/updateEvent'
import { Checkbox } from '~/components/Checkbox'
import { useGetOrgs } from '~/layout/MainLayout/api'
import { Spinner } from '~/components/Spinner'

import { type Action, type Condition, type EventType } from '../../types'
import {
  conditionTypeOptions,
  createEventSchema,
  operatorOptions,
  type IntervalData,
  logicalOperatorOption,
  actionTypeOptions,
  eventTypeOptions,
} from './CreateEvent'

import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { PlusIcon } from '~/components/SVGIcons'

type UpdateEventProps = {
  eventId: string
  name: string
  close: () => void
  isOpen: boolean
  data: EventType
  dataAction: Action[]
  conditionData: Condition[]
  dateArr: any[]
  type: string
  startTimeProps: string
  endTimeProps: string
}

export function UpdateEvent({
  eventId,
  name,
  data,
  dataAction,
  conditionData,
  dateArr,
  close,
  isOpen,
  type,
  startTimeProps,
  endTimeProps,
}: UpdateEventProps) {
  const { t } = useTranslation()
  const { orgId } = useParams()

  const {
    register,
    formState,
    handleSubmit,
    control,
    watch,
    getValues,
    setValue,
  } = useForm<UpdateEventDTO['data']>({
    resolver: createEventSchema && zodResolver(createEventSchema),
    defaultValues: {
      onClick: (data.onClick as unknown as string) === 'true',
      name,
      action: dataAction,
      retry: data.retry,
      status: (data.status as unknown as string) === 'true',
      condition: conditionData,
      interval: renderInterval(),
      type,
      org_id: data.org_id,
      group_id: data.group_id,
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

  const { mutate, isLoading, isSuccess } = useUpdateEvent()

  const projectId = storage.getProject()?.id

  const { data: orgData, isLoading: orgIsLoading } = useGetOrgs({ projectId })
  const { acc: orgFlattenData } = flattenData(
    orgData?.organizations,
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )
  const orgSelectOptions = orgFlattenData?.map(org => ({
    label: org?.name,
    value: org?.id,
  }))

  const { data: groupData, isLoading: groupIsLoading } = useGetGroups({
    orgId: watch('org_id') || orgId,
    projectId,
    entity_type: 'EVENT',
    config: { suspense: false },
  })
  const groupSelectOptions = groupData?.groups?.map(group => ({
    label: group?.name,
    value: group?.id,
  }))

  const { data: deviceData, isLoading: deviceIsLoading } = useGetDevices({
    orgId: watch('org_id') || orgId,
    projectId,
    config: { suspense: false },
  })
  const deviceSelectOptions = deviceData?.devices.map(device => ({
    value: device.id,
    label: device.name,
  }))

  const {
    data: attrData,
    mutate: attrMutate,
    isLoading: attrIsLoading,
  } = useCreateAttrChart()
  const attrSelectOptions = attrData?.keys?.map(item => ({
    value: item,
    label: item,
  }))

  const [todos, setTodos] = useState(dateArr)

  const todoClicked = (e: any) => {
    setTodos(
      todos.map(todo =>
        todo.id === e.target.getAttribute('data-id')
          ? { ...todo, selected: !todo.selected }
          : todo,
      ),
    )
  }

  function renderInterval() {
    const dataFilter = dateArr.filter(item => item.selected)

    const intervalDay: IntervalData = {}
    dataFilter.map(item => {
      intervalDay[item.value] = item.selected
    })
    const interval = {
      ...intervalDay,
      start_time: startTimeProps,
      end_time: endTimeProps,
    }
    return interval
  }

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  const showSpinner = useSpinDelay(groupSelectOptions == null, {
    delay: 150,
    minDuration: 300,
  })

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      title={t('cloud:org_manage.event_manage.add_event.edit')}
      size="lg"
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
            form="update-event"
            type="submit"
            size="lg"
            isLoading={isLoading}
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
            // disabled={!formState.isDirty}
          />
        </>
      )}
    >
      <form
        id="update-event"
        className="w-full space-y-5"
        onSubmit={handleSubmit(values => {
          console.log('values', values)
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
          const conditionArr =
            ('condition' in values &&
              values.condition.map(item => ({
                device_id: item.device_id,
                attribute_name: item.attribute_name,
                condition_type: item.condition_type,
                operator: item.operator,
                threshold: item.threshold,
                logical_operator: item.logical_operator,
              }))) ||
            []
          const actionArr = values.action?.map(item => ({
            action_type: item.action_type,
            receiver: item.receiver,
            message: item.message,
            subject: item.subject,
          }))
          console.log('conditionArr', conditionArr)

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
            eventId,
          })
        })}
      >
        {groupSelectOptions != null ? (
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
                    label={t(
                      'cloud:org_manage.device_manage.add_device.parent',
                    )}
                    name="org_id"
                    control={control}
                    options={orgSelectOptions}
                    isOptionDisabled={option =>
                      option.label === t('loading:org') ||
                      option.label === t('table:no_org')
                    }
                    noOptionsMessage={() => t('table:no_org')}
                    loadingMessage={() => t('loading:org')}
                    isLoading={orgIsLoading}
                    defaultValue={orgSelectOptions.find(
                      item => item.value === getValues('org_id'),
                    )}
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
                    options={groupSelectOptions}
                    isOptionDisabled={option =>
                      option.label === t('loading:group') ||
                      option.label === t('table:no_group')
                    }
                    noOptionsMessage={() => t('table:no_group')}
                    loadingMessage={() => t('loading:group')}
                    isLoading={groupIsLoading}
                    defaultValue={groupSelectOptions?.find(
                      item => item.value === getValues('group_id'),
                    )}
                  />
                  <p className="text-body-sm text-primary-400">
                    {formState?.errors?.group_id?.message}
                  </p>
                </div>
                <FieldWrapper
                  label={t('cloud:org_manage.event_manage.add_event.status')}
                  error={formState?.errors['status']}
                  className="w-fit"
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
                  className="w-fit"
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
                          onClick={() => {
                            if (getValues('type') === 'event') {
                              setValue('type', 'schedule')
                            }
                          }}
                        />
                      )
                    }}
                  />
                </FieldWrapper>
                <SelectField
                  label={t(
                    'cloud:org_manage.event_manage.add_event.type_event',
                  )}
                  error={formState.errors['type']}
                  registration={register('type')}
                  options={eventTypeOptions}
                  disabled={watch('onClick')}
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
                  disabled={watch('type') === 'schedule'}
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
                            options={deviceSelectOptions}
                            isOptionDisabled={option =>
                              option.label === t('loading:device') ||
                              option.label === t('table:no_device')
                            }
                            noOptionsMessage={() => t('table:no_device')}
                            loadingMessage={() => t('loading:device')}
                            isLoading={deviceIsLoading}
                            defaultValue={deviceSelectOptions?.find(
                              item =>
                                item.value ===
                                getValues(`condition.${index}.device_id`),
                            )}
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
                            control={control}
                            options={attrSelectOptions}
                            isOptionDisabled={option =>
                              option.label === t('loading:attr') ||
                              option.label === t('table:no_attr')
                            }
                            noOptionsMessage={() => t('table:no_attr')}
                            loadingMessage={() => t('loading:attr')}
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
                            defaultValue={{
                              label: getValues(
                                `condition.${index}.attribute_name`,
                              ),
                              value: getValues(
                                `condition.${index}.attribute_name`,
                              ),
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
                            formState?.errors?.condition?.[index]
                              ?.condition_type
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
                          error={
                            formState?.errors?.condition?.[index]?.operator
                          }
                          registration={register(`condition.${index}.operator`)}
                          options={operatorOptions}
                        />
                        <InputField
                          label={t(
                            'cloud:org_manage.event_manage.add_event.condition.threshold',
                          )}
                          error={
                            formState?.errors?.condition?.[index]?.threshold
                          }
                          registration={register(
                            `condition.${index}.threshold`,
                          )}
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
                title={t(
                  'cloud:org_manage.event_manage.add_event.action.title',
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
                        error={formState?.errors?.action?.[index]?.receiver}
                      />
                    </div>
                    <div className="space-y-1">
                      <InputField
                        label={t(
                          'cloud:org_manage.event_manage.add_event.action.subject',
                        )}
                        registration={register(`action.${index}.subject`)}
                        error={formState?.errors?.action?.[index]?.subject}
                      />
                    </div>
                    <div className="flex justify-end">
                      <InputField
                        label={t(
                          'cloud:org_manage.event_manage.add_event.action.message',
                        )}
                        registration={register(`action.${index}.message`)}
                        error={formState?.errors?.action?.[index]?.message}
                      />
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
        ) : (
          <div className="flex h-full items-center justify-center">
            <Spinner showSpinner={showSpinner} size="xl" />
          </div>
        )}
      </form>
    </Drawer>
  )
}
