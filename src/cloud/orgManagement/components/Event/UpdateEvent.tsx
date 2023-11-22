import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Controller } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { Button } from '~/components/Button'
import {
  FieldWrapper,
  FormMultipleFields,
  InputField,
  SelectDropdown,
  SelectField,
  type SelectOption,
} from '~/components/Form'
import TitleBar from '~/components/Head/TitleBar'
import { queryClient } from '~/lib/react-query'
import { cn, flattenData } from '~/utils/misc'
import storage from '~/utils/storage'
import { useGetAttrs } from '../../api/attrAPI'
import { useGetDevices } from '../../api/deviceAPI'
import { useGetGroups } from '../../api/groupAPI'
import { Drawer } from '~/components/Drawer'
import {
  useUpdateEvent,
  type UpdateEventDTO,
} from '../../api/eventAPI/updateEvent'
import { Checkbox } from '~/components/Checkbox'

import { type OrgList } from '~/layout/MainLayout/types'
import {
  type Action,
  type ActionType,
  type Condition,
  type DeviceList,
  type EventType,
  type Group,
} from '../../types'
import {
  conditionTypeOptions,
  createEventSchema,
  operatorOptions,
  type IntervalData,
  logicalOperatorOption,
  actionTypeOptions,
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
  startTimeProps,
  endTimeProps,
  type,
  close,
  isOpen,
}: UpdateEventProps) {
  console.log(data)
  const { t } = useTranslation()

  const [onClickValue, setOnclickValue] = useState(data.onClick)
  const [typeEvent, setTypeEvent] = useState(type)
  const [startTime, setStartTime] = useState(startTimeProps)
  const [endTime, setEndTime] = useState(endTimeProps)
  const [orgValue, setOrgValue] = useState<SelectOption | null>()
  const [groupValue, setGroupValue] = useState<SelectOption | null>({
    label: data?.group_name,
    value: data?.group_id,
  })

  const { id: projectId } = storage.getProject()
  const { mutate, isLoading, isSuccess } = useUpdateEvent()

  useEffect(() => {
    if (!data?.group_id) {
      setGroupValue(null)
    }
  }, [eventId])

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
    // config: { enabled: false },
  })
  const deviceListCache: DeviceList | undefined = queryClient.getQueryData(
    ['devices'],
    { exact: false },
  )
  const deviceSelectData = deviceData?.devices.map(device => ({
    value: device.id,
    label: device.name,
  })) || [{ value: '', label: '' }]

  const groupDataSelect = groupData?.groups.map(group => ({
    label: group?.name,
    value: group?.id,
  })) || [{ label: t('loading:group'), value: '' }]

  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  const { data: attrData, refetch: refetchAttrData } = useGetAttrs({
    entityType: 'DEVICE',
    entityId: selectedDeviceId,
    config: {
      enabled: !!selectedDeviceId,
      suspense: false,
    },
  })
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

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  const renderDataCondition = () => {
    const defaultCondition = conditionData?.map(item => {
      const conditionType = conditionTypeOptions.filter(
        e => e.value === item.condition_type,
      )
      const operatorFilter = operatorOptions.filter(
        e => e.value === item.operator,
      )
      const logicalOperator = logicalOperatorOption.filter(
        e => e.value === item.logical_operator,
      )
      const deviceFilter = deviceSelectData.filter(
        e => e.value === item.device_id,
      )
      return {
        ...item,
        attribute_name: {
          label: item.attribute_name,
          value: item.attribute_name,
        },
        device_id: deviceFilter[0],
        condition_type: conditionType[0],
        operator: operatorFilter[0],
        logical_operator: logicalOperator[0],
      }
    })
    return defaultCondition
  }

  const renderDataAction = () => {
    const defaultAction = dataAction?.map(item => {
      const actionType = actionTypeOptions.filter(
        e => e.value === item.action_type,
      )
      return {
        ...item,
        action_type: actionType[0],
      }
    })
    return defaultAction
  }

  const renderInterval = () => {
    const dataFilter = dateArr.filter(item => item.selected)

    const intervalDay: IntervalData = {}
    dataFilter.map(item => {
      intervalDay[item.value] = item.selected
    })
    const interval = {
      ...intervalDay,
      start_time: startTime,
      end_time: endTime,
    }
    return interval
  }

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
          />
        </>
      )}
    >
      <FormMultipleFields<UpdateEventDTO['data'], typeof createEventSchema>
        id="update-event"
        options={{
          defaultValues: {
            onClick: (data.onClick + '').toLowerCase() === 'true',
            name,
            action: renderDataAction(),
            retry: data.retry.toString(),
            status: (data.status + '').toLowerCase() === 'true',
            condition: renderDataCondition(),
            interval: renderInterval(),
          },
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
              onClick: typeEvent === 'event' ? values.onClick === true : false,
              condition: values.onClick === false ? conditionArr : [],
              action: actionArr,
              status: Boolean(values.status),
              retry: values.retry ? parseInt(values.retry) : null,
              schedule: scheduleValue,
              interval,
              type: typeEvent,
            },
            eventId,
          })
        }}
        schema={createEventSchema}
        name={['condition', 'action']}
      >
        {(
          { register, formState, control, setValue },
          {
            append: conditionAppend,
            fields: conditionFields,
            remove: conditionRemove,
          },
          { append: actionAppend, fields: actionFields, remove: actionRemove },
        ) => {
          console.log('control: ', control)
          return (
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
                      label={t('cloud:org_manage.event_manage.add_event.group')}
                      name="group_id"
                      control={control}
                      options={groupDataSelect}
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
                            checked={Boolean(value)}
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
                            checked={Boolean(value)}
                            onCheckedChange={onChange}
                            disabled={typeEvent === 'schedule'}
                          />
                        )
                      }}
                    />
                  </FieldWrapper>
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
                    value={typeEvent}
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
                  <div className="relative w-full">
                    <p className="mb-2 text-center">
                      {t('cloud:org_manage.event_manage.add_event.start')}
                    </p>
                    <input
                      name="startTime"
                      value={startTime}
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
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      className="w-full rounded border border-solid border-slate-300 px-4 py-2"
                      type="time"
                    />
                  </div>
                </div>
              </div>
              {onClickValue === false && typeEvent === 'event' ? (
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
                    onClick={() => conditionAppend()}
                  />
                </div>
              ) : null}
              {onClickValue === false && typeEvent === 'event'
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
                              noOptionsMessage={() => t('table:no_device')}
                              onChange={e => {
                                setSelectedDeviceId(e?.value)
                                setValue(`condition.${index}.device_id`, e)
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
                              label={t(
                                'cloud:org_manage.event_manage.add_event.condition.condition_type.title',
                              )}
                              name={`condition.${index}.condition_type`}
                              options={conditionTypeOptions}
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
                              options={operatorOptions}
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
                              label={t(
                                'cloud:org_manage.event_manage.add_event.condition.logical_operator.title',
                              )}
                              name={`condition.${index}.logical_operator`}
                              options={logicalOperatorOption}
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
                  className="w-full rounded-md bg-secondary-700 pl-3"
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
                  <section className="!mt-3 space-y-2" key={field.id}>
                    <div className="grid grid-cols-1 gap-x-4 md:grid-cols-4">
                      <div className="space-y-1">
                        <SelectDropdown
                          label={t(
                            'cloud:org_manage.event_manage.add_event.action.action_type.title',
                          )}
                          name={`action.${index}.action_type`}
                          options={actionTypeOptions}
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
    </Drawer>
  )
}
