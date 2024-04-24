import { useEffect, useRef, useState } from 'react'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateAttrChart } from '@/cloud/dashboard/api'
import { useSpinDelay } from 'spin-delay'
import { useParams } from 'react-router-dom'
import { type SelectInstance } from 'react-select'
import { Button } from '@/components/Button'
import {
  FieldWrapper,
  InputField,
  SelectDropdown,
  SelectField,
  type SelectOption,
} from '@/components/Form'
import TitleBar from '@/components/Head/TitleBar'
import storage from '@/utils/storage'
import { useGetDevices } from '../../api/deviceAPI'
import { useGetGroups } from '../../api/groupAPI'
import {
  useUpdateEvent,
  type UpdateEventDTO,
} from '../../api/eventAPI/updateEvent'
import { Checkbox } from '@/components/Checkbox'
import { useGetOrgs } from '@/layout/MainLayout/api'
import { Spinner } from '@/components/Spinner'
import { outputList } from '@/cloud/customProtocol/components/CreateService'
import {
  type ActionType,
  type Action,
  type Condition,
  type EventType,
} from '../../types'
import {
  conditionTypeOptions,
  operatorOptions,
  type IntervalData,
  logicalOperatorOption,
  actionTypeOptions,
  eventTypeOptions,
  eventActionSchema,
  cmdSchema,
  eventTypeSchema,
  eventConditionSchema,
} from './CreateEvent'
import { useGetEntityThings } from '@/cloud/customProtocol/api/entityThing'
import { useGetServiceThings } from '@/cloud/customProtocol/api/serviceThing'
import { nameSchema } from '@/utils/schemaValidation'
import { inputSchema } from '@/cloud/flowEngineV2/components/ThingService'

import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { PlusIcon } from '@/components/SVGIcons'
import { SelectSuperordinateOrgTree } from '@/components/SelectSuperordinateOrgTree'
import { useOrgById } from '@/layout/OrgManagementLayout/api'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn, flattenOrgs } from '@/utils/misc'

type UpdateEventProps = {
  eventId: string
  name: string
  close: () => void
  isOpen: boolean
  data: EventType
  dataAction: Action[]
  conditionData: Condition[] | null
  dateArr: any[]
  type: string
  startTimeProps?: string
  endTimeProps?: string
}

const updateCmdSchema = cmdSchema
  .omit({ input: true })
  .and(z.object({ input: inputSchema.pick({ value: true }) }))

export const updateEventSchema = z
  .object({
    project_id: z.string().optional(),
    org_id: z.string().optional().or(z.array(z.string())),
    group_id: z.string().optional(),
    name: nameSchema,
    action: eventActionSchema,
    status: z.boolean().optional(),
    retry: z.number().optional(),
    onClick: z.boolean(),
    cmd: updateCmdSchema.optional(),
  })
  .and(eventTypeSchema)
  .and(
    z.discriminatedUnion('onClick', [
      z.object({
        onClick: z.literal(true),
        condition: z.tuple([]).nullish(),
      }),
      z.object({
        onClick: z.literal(false),
        condition: eventConditionSchema,
      }),
    ]),
  )

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
  const projectId = storage.getProject()?.id
  const no_org_val = t('cloud:org_manage.org_manage.add_org.no_org')

  const actionTypeProp: ActionType = data.action[0].action_type
  const thingIdOptionProp = data.cmd.thing_id
  const serviceOptionProp = data.cmd.service_name
  const inputDataProp = data.cmd.input

  const [actionType, setActionType] = useState<ActionType>(actionTypeProp)
  const { data: thingData, isLoading: isLoadingThing } = useGetEntityThings({
    projectId,
    type: 'thing',
  })
  const thingSelectData = thingData?.data?.list?.map(thing => ({
    value: thing.id,
    label: thing.name,
  }))

  const form = useForm<UpdateEventDTO['data']>({
    resolver: updateEventSchema && zodResolver(updateEventSchema),
    defaultValues: {
      onClick: data.onClick,
      name,
      action: dataAction,
      retry: data.retry,
      status: data.status,
      condition: conditionData,
      interval: renderInterval(),
      type,
      org_id: data.org_id,
      group_id: data.group_id,
      cmd: {
        thing_id: thingIdOptionProp,
        handle_service: serviceOptionProp ?? '',
        input: inputDataProp ?? {},
      },
    },
  })
  const {
    register,
    formState,
    handleSubmit,
    control,
    watch,
    getValues,
    setValue,
    resetField,
  } = form

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

  const { mutate, isLoading, isSuccess } = useUpdateEvent()

  const { data: orgData, isLoading: orgIsLoading } = useGetOrgs({
    projectId,
    config: {
      suspense: false,
    },
  })
  const orgDataFlatten = flattenOrgs(orgData?.organizations ?? [])
  const { data: orgDataById } = useOrgById({ orgId: data?.org_id })

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

  const { data: serviceData, isLoading: isLoadingService } =
    useGetServiceThings({
      thingId: watch('cmd.thing_id') ?? '',
      config: {
        suspense: false,
        enabled:
          !!watch('cmd.thing_id') &&
          parseInt(watch('cmd.thing_id') as unknown as string) !== 0,
      },
    })
  const serviceSelectData = serviceData?.data?.map(service => ({
    value: service.name,
    label: service.name,
  }))
  const serviceInput = serviceData?.data?.find(
    item => item.name === watch('cmd.handle_service'),
  )?.input

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
    serviceInput?.forEach((element, idx) => {
      setValue(`cmd.input.${idx}.name`, element.name)
      setValue(
        `cmd.input.${idx}.type`,
        element.type === 'string' ? 'str' : element.type,
      )
      setValue(`cmd.input.${idx}.value`, inputDataProp?.[element.name])
    })
  }, [watch('cmd.handle_service')])

  const selectDropdownServiceRef = useRef<SelectInstance<SelectOption> | null>(
    null,
  )

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
    <Sheet open={isOpen} onOpenChange={close} modal={false}>
      <SheetContent
        onInteractOutside={e => {
          e.preventDefault()
        }}
        className={cn('flex h-full max-w-4xl flex-col justify-between')}
      >
        <SheetHeader>
          <SheetTitle>
            {t('cloud:org_manage.event_manage.add_event.edit')}
          </SheetTitle>
        </SheetHeader>
        <div className="min-h-[85%] overflow-y-auto">
          <Form {...form}>
            <form
              id="update-event"
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
                const conditionArr =
                  ('condition' in values &&
                    values.condition.map(item => ({
                      device_id: item.device_id,
                      device_name: item.device_name,
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
                mutate({
                  data: {
                    project_id: projectId,
                    org_id: values.org_id !== no_org_val ? values.org_id : '',
                    group_id: values.group_id,
                    name: values.name,
                    onClick: values.onClick,
                    condition: values.onClick === false ? conditionArr : [],
                    action: actionArr,
                    status: values.status === true,
                    retry: values.retry,
                    schedule: scheduleValue,
                    interval,
                    type: getValues('type'),
                    cmd: {
                      thing_id: values?.cmd?.thing_id,
                      service_name: values?.cmd?.handle_service,
                      project_id: projectId,
                      input: values?.cmd?.input,
                    },
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
                        label={t(
                          'cloud:org_manage.event_manage.add_event.name',
                        )}
                        error={formState.errors['name']}
                        registration={register('name')}
                      />
                      <FormField
                        control={form.control}
                        name="org_id"
                        render={({ field: { onChange, value, ...field } }) => (
                          <FormItem>
                            <FormLabel>
                              {t(
                                'cloud:org_manage.device_manage.add_device.parent',
                              )}
                            </FormLabel>
                            <div>
                              <FormControl>
                                <div>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        id="org_id"
                                        className={cn(
                                          'block w-full rounded-md border border-secondary-600 bg-white px-3 py-2 !text-body-sm text-black placeholder-secondary-700 shadow-sm *:appearance-none focus:outline-2 focus:outline-focus-400 focus:ring-focus-400 disabled:cursor-not-allowed disabled:bg-secondary-500',
                                          {
                                            'text-gray-500':
                                              !value && value !== '',
                                          },
                                        )}
                                      >
                                        {value
                                          ? orgDataFlatten.find(
                                              item => item.id === value,
                                            )?.name
                                          : value === ''
                                            ? t('tree:no_selection_org')
                                            : t('placeholder:select_org')}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                      <SelectSuperordinateOrgTree
                                        {...field}
                                        onChangeValue={onChange}
                                        value={value}
                                        noSelectionOption={true}
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <SelectDropdown
                        label={t(
                          'cloud:org_manage.event_manage.add_event.group',
                        )}
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
                        error={formState?.errors?.group_id}
                      />

                      <FieldWrapper
                        label={t(
                          'cloud:org_manage.event_manage.add_event.status',
                        )}
                        error={formState?.errors['status']}
                        className="w-fit"
                      >
                        <Controller
                          control={control}
                          name={'status'}
                          render={({
                            field: { onChange, value, ...field },
                          }) => {
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
                          render={({
                            field: { onChange, value, ...field },
                          }) => {
                            return (
                              <Checkbox
                                {...field}
                                checked={value}
                                onCheckedChange={e => {
                                  onChange(e)
                                  if (e) {
                                    setValue('type', 'event')
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
                        label={t(
                          'cloud:org_manage.event_manage.add_event.retry',
                        )}
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
                        label={t(
                          'cloud:org_manage.event_manage.add_event.start',
                        )}
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
                          <PlusIcon
                            width={16}
                            height={16}
                            viewBox="0 0 16 16"
                          />
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
                                onChange={event => {
                                  setValue(
                                    `condition.${index}.device_id`,
                                    event.value,
                                  )
                                  setValue(
                                    `condition.${index}.device_name`,
                                    event.label,
                                  )
                                }}
                                error={
                                  formState?.errors?.condition?.[index]
                                    ?.device_id
                                }
                              />

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
                                error={
                                  formState?.errors?.condition?.[index]
                                    ?.attribute_name
                                }
                              />

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
                                  formState?.errors?.condition?.[index]
                                    ?.operator
                                }
                                registration={register(
                                  `condition.${index}.operator`,
                                )}
                                options={operatorOptions}
                              />
                              <InputField
                                label={t(
                                  'cloud:org_manage.event_manage.add_event.condition.threshold',
                                )}
                                error={
                                  formState?.errors?.condition?.[index]
                                    ?.threshold
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
                    {actionType !== 'report' && (
                      <Button
                        className="rounded-md"
                        variant="trans"
                        size="square"
                        startIcon={
                          <PlusIcon
                            width={16}
                            height={16}
                            viewBox="0 0 16 16"
                          />
                        }
                        onClick={() => {
                          actionAppend([{}])
                        }}
                      />
                    )}
                  </div>
                  {actionFields.map((field, index) => {
                    return (
                      <section className="!mt-3 space-y-2" key={field.id}>
                        <div className="grid grid-cols-1 gap-x-4 md:grid-cols-4">
                          <SelectField
                            label={t(
                              'cloud:org_manage.event_manage.add_event.action.action_type.title',
                            )}
                            error={
                              formState?.errors?.action?.[index]?.action_type
                            }
                            registration={register(
                              `action.${index}.action_type`,
                              {
                                onChange: e => {
                                  setActionType(e.target.value)
                                },
                              },
                            )}
                            options={
                              actionFields.length < 2
                                ? actionTypeOptions
                                : actionTypeOptions.filter(
                                    item => item.value !== 'report',
                                  )
                            }
                          />
                          {actionType === 'report' ? (
                            <SelectDropdown
                              label={t('cloud:custom_protocol.thing.id')}
                              name="cmd.thing_id"
                              control={control}
                              options={thingSelectData}
                              isOptionDisabled={option =>
                                option.label === t('loading:entity_thing') ||
                                option.label === t('table:no_thing')
                              }
                              noOptionsMessage={() => t('table:no_thing')}
                              loadingMessage={() => t('loading:entity_thing')}
                              isLoading={isLoadingThing}
                              placeholder={t(
                                'cloud:custom_protocol.thing.choose',
                              )}
                              handleClearSelectDropdown={() =>
                                selectDropdownServiceRef.current?.clearValue()
                              }
                              handleChangeSelect={() =>
                                selectDropdownServiceRef.current?.clearValue()
                              }
                              defaultValue={thingSelectData?.find(
                                ele => ele.value === thingIdOptionProp,
                              )}
                              error={formState?.errors?.cmd?.thing_id}
                            />
                          ) : (
                            <div className="space-y-1">
                              <InputField
                                label={t(
                                  'cloud:org_manage.event_manage.add_event.action.address',
                                )}
                                registration={register(
                                  `action.${index}.receiver`,
                                )}
                                error={
                                  formState?.errors?.action?.[index]?.receiver
                                }
                              />
                            </div>
                          )}
                          {actionType === 'report' ? (
                            isLoadingService ? null : (
                              <SelectDropdown
                                refSelect={selectDropdownServiceRef}
                                label={t('cloud:custom_protocol.service.title')}
                                name="cmd.handle_service"
                                control={control}
                                options={serviceSelectData}
                                isOptionDisabled={option =>
                                  option.label === t('loading:service_thing') ||
                                  option.label === t('table:no_service')
                                }
                                isLoading={isLoadingService}
                                loadingMessage={() =>
                                  t('loading:service_thing')
                                }
                                noOptionsMessage={() => t('table:no_service')}
                                placeholder={t(
                                  'cloud:custom_protocol.service.choose',
                                )}
                                customOnChange={() =>
                                  resetField(`cmd.input.${index}.value`)
                                }
                                defaultValue={serviceSelectData?.find(
                                  ele => ele.label === serviceOptionProp,
                                )}
                                error={formState?.errors?.cmd?.handle_service}
                              />
                            )
                          ) : (
                            <div className="space-y-1">
                              <InputField
                                label={t(
                                  'cloud:org_manage.event_manage.add_event.action.subject',
                                )}
                                registration={register(
                                  `action.${index}.subject`,
                                )}
                                error={
                                  formState?.errors?.action?.[index]?.subject
                                }
                              />
                            </div>
                          )}
                          <div className="flex justify-end">
                            {actionType === 'report' ? (
                              <div className="max-h-44 overflow-auto">
                                {serviceInput?.map((element, index) => {
                                  return (
                                    <div
                                      key={`key-${index}`}
                                      className="mb-3 space-y-3 border-b-4 pb-3"
                                    >
                                      <InputField
                                        disabled
                                        require={true}
                                        label={t(
                                          'cloud:custom_protocol.service.service_input.name',
                                        )}
                                        error={
                                          formState?.errors?.cmd?.input?.[index]
                                            ?.name
                                        }
                                        registration={register(
                                          `cmd.input.${index}.name` as const,
                                        )}
                                        defaultValue={element.name}
                                      />
                                      <SelectField
                                        disabled
                                        label={t(
                                          'cloud:custom_protocol.service.service_input.type',
                                        )}
                                        require={true}
                                        error={
                                          formState.errors.cmd?.input?.[index]
                                            ?.type
                                        }
                                        registration={register(
                                          `cmd.input.${index}.type` as const,
                                        )}
                                        options={outputList}
                                        className="h-9 px-2"
                                        defaultValue={
                                          element.type === 'string'
                                            ? 'str'
                                            : element.type
                                        }
                                      />
                                      {watch(`cmd.input.${index}.type`) ===
                                      'bool' ? (
                                        <FieldWrapper
                                          label={t(
                                            'cloud:custom_protocol.service.service_input.value',
                                          )}
                                          error={
                                            formState?.errors?.cmd?.input?.[
                                              index
                                            ]?.value
                                          }
                                          className="w-fit"
                                        >
                                          <Controller
                                            control={control}
                                            name={`cmd.input.${index}.value`}
                                            render={({
                                              field: {
                                                onChange,
                                                value,
                                                ...field
                                              },
                                            }) => {
                                              return (
                                                <Checkbox
                                                  {...field}
                                                  checked={value as boolean}
                                                  onCheckedChange={onChange}
                                                  defaultChecked
                                                />
                                              )
                                            }}
                                          />
                                          <span className="pl-3">True</span>
                                        </FieldWrapper>
                                      ) : (
                                        <InputField
                                          defaultValue={
                                            inputDataProp?.[element.name]
                                          }
                                          label={t(
                                            'cloud:custom_protocol.service.service_input.value',
                                          )}
                                          error={
                                            formState?.errors?.cmd?.input?.[
                                              index
                                            ]?.value
                                          }
                                          registration={register(
                                            `cmd.input.${index}.value` as const,
                                          )}
                                          type={
                                            ['json', 'str'].includes(
                                              watch(`cmd.input.${index}.type`),
                                            )
                                              ? 'text'
                                              : 'number'
                                          }
                                        />
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <InputField
                                label={t(
                                  'cloud:org_manage.event_manage.add_event.action.message',
                                )}
                                registration={register(
                                  `action.${index}.message`,
                                )}
                                error={
                                  formState?.errors?.action?.[index]?.message
                                }
                              />
                            )}
                            <Button
                              type="button"
                              size="square"
                              variant="trans"
                              className="ml-5 mt-3 border-none"
                              onClick={() => {
                                setActionType('sms')
                                actionRemove(index)
                              }}
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
          </Form>
        </div>

        <SheetFooter>
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
              disabled={isLoading}
            />
          </>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
