import { useEffect, useRef, useState } from 'react'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateAttrChart } from '@/cloud/dashboard/api'
import { useSpinDelay } from 'spin-delay'
import { useParams } from 'react-router-dom'
import { type SelectInstance } from 'react-select'
import { Button } from '@/components/ui/button'
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
import { Checkbox } from '@/components/ui/checkbox'
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
  conditionEventOptions,
  deviceNameOptions,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
import { Input } from '@/components/ui/input'
import { NewSelectDropdown } from '@/components/Form/NewSelectDropdown'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
    condition_event_type: z.string().optional(),
  })
  .and(eventTypeSchema)
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
      condition_event_type:
        conditionData?.length && conditionData?.[0]?.device_id === 'weather'
          ? 'weather_condition'
          : 'device_condition',
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
  })
  const orgDataFlatten = flattenOrgs(orgData?.organizations ?? [])
  const { data: orgDataById } = useOrgById({ orgId: data?.org_id })

  const { data: groupData, isLoading: groupIsLoading } = useGetGroups({
    orgId: watch('org_id') || orgId,
    projectId,
    entity_type: 'EVENT',
  })
  const groupSelectOptions = groupData?.groups?.map(group => ({
    label: group?.name,
    value: group?.id,
  }))

  const { data: deviceData, isLoading: deviceIsLoading } = useGetDevices({
    orgId: watch('org_id') || orgId,
    projectId,
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
    if (!watch('onClick') && watch('type') === 'event') {
      if (conditionData && conditionData.length > 0) {
        setValue('condition', conditionData)
      } else {
        conditionAppend([{}])
      }
    } else {
      setValue('condition', [])
    }
  }, [watch('onClick'), watch('type')])

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
    if (isSuccess && close) {
      close()
    }
  }, [isSuccess])

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
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
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
                      device_name: item.device_name ?? '',
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
                    <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t(
                                'cloud:org_manage.event_manage.add_event.name',
                              )}
                            </FormLabel>
                            <div>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder={t(
                                    'cloud:org_manage.event_manage.add_event.input_placeholder',
                                  )}
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
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
                                          'block w-full rounded-md border border-secondary-600 bg-white px-3 py-2 !text-body-sm text-black placeholder-secondary-700 shadow-sm *:appearance-none focus:border-[#2684FF] disabled:cursor-not-allowed disabled:bg-secondary-500',
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

                      <FormField
                        control={form.control}
                        name="group_id"
                        render={({ field: { onChange, value, ...field } }) => (
                          <FormItem>
                            <FormLabel>
                              {t(
                                'cloud:org_manage.event_manage.add_event.group',
                              )}
                            </FormLabel>
                            <div>
                              <FormControl>
                                <NewSelectDropdown
                                  options={groupSelectOptions}
                                  isOptionDisabled={option =>
                                    option.label === t('loading:group') ||
                                    option.label === t('table:no_group')
                                  }
                                  noOptionsMessage={() => t('table:no_group')}
                                  loadingMessage={() => t('loading:group')}
                                  isLoading={groupIsLoading}
                                  defaultValue={groupSelectOptions?.find(
                                    item =>
                                      item.value === getValues('group_id'),
                                  )}
                                  error={formState?.errors?.group_id}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="status"
                        render={({ field: { onChange, value, ...field } }) => (
                          <FormItem>
                            <FormLabel>
                              {t(
                                'cloud:org_manage.event_manage.add_event.status',
                              )}
                            </FormLabel>
                            <div>
                              <FormControl>
                                <Checkbox
                                  {...field}
                                  checked={value}
                                  onCheckedChange={onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="onClick"
                        render={({ field: { onChange, value, ...field } }) => (
                          <FormItem>
                            <FormLabel>
                              {t(
                                'cloud:org_manage.event_manage.add_event.condition.onClick',
                              )}
                            </FormLabel>
                            <div>
                              <FormControl>
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
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="type"
                        // disabled={watch('onClick')}
                        render={({ field: { onChange, value, ...field } }) => (
                          <FormItem>
                            <FormLabel>
                              {t(
                                'cloud:org_manage.event_manage.add_event.type_event',
                              )}
                            </FormLabel>
                            <div>
                              <Select
                                {...field}
                                onValueChange={e => {
                                  onChange(e)
                                  if (e === 'schedule') {
                                    setValue('interval.end_time', '')
                                  }
                                }}
                                value={value}
                              >
                                <FormControl>
                                  <SelectTrigger disabled={watch('onClick')}>
                                    <SelectValue
                                      placeholder={t(
                                        'cloud:org_manage.event_manage.add_event.input_placeholder',
                                      )}
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {eventTypeOptions?.map(type => (
                                    <SelectItem
                                      key={type.value}
                                      value={type.value}
                                    >
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="retry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t(
                                'cloud:org_manage.event_manage.add_event.retry',
                              )}
                            </FormLabel>
                            <div>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  {...register('retry', {
                                    valueAsNumber: true,
                                  })}
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="condition_event_type"
                        render={({ field: { onChange, value, ...field } }) => (
                          <FormItem>
                            <FormLabel>
                              {t(
                                'cloud:org_manage.event_manage.add_event.condition_event_type',
                              )}
                            </FormLabel>
                            <div>
                              <Select
                                {...field}
                                onValueChange={onChange}
                                value={value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={t(
                                        'cloud:org_manage.event_manage.add_event.condition_event_type',
                                      )}
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {conditionEventOptions?.map(type => (
                                    <SelectItem
                                      key={type.value}
                                      value={type.value}
                                    >
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
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
                    <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-4">
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
                      <FormField
                        control={control}
                        name="interval.start_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t(
                                'cloud:org_manage.event_manage.add_event.start',
                              )}
                            </FormLabel>
                            <div>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="interval.end_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('cloud:org_manage.event_manage.add_event.end')}
                            </FormLabel>
                            <div>
                              <FormControl>
                                <Input
                                  type="time"
                                  {...field}
                                  disabled={watch('type') === 'schedule'}
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
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
                            <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-3">
                              {/* <SelectDropdown
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
                              /> */}
                              {watch('condition_event_type') ===
                              'device_condition' ? (
                                <FormField
                                  control={control}
                                  name={`condition.${index}.device_id`}
                                  render={({
                                    field: { value, onChange, ...field },
                                  }) => (
                                    <FormField
                                      control={control}
                                      name={`condition.${index}.device_id`}
                                      render={({
                                        field: { value, onChange, ...field },
                                      }) => (
                                        <FormItem>
                                          <FormLabel>
                                            {t(
                                              'cloud:org_manage.event_manage.add_event.condition.device',
                                            )}
                                          </FormLabel>
                                          <div>
                                            <FormControl>
                                              <NewSelectDropdown
                                                classnamefieldwrapper="h-9"
                                                options={deviceSelectOptions}
                                                customOnChange={value => {
                                                  const filter =
                                                    deviceSelectData?.filter(
                                                      item =>
                                                        item.value === value,
                                                    )
                                                  setValue(
                                                    `condition.${index}.device_id`,
                                                    value,
                                                  )
                                                  setValue(
                                                    `condition.${index}.device_name`,
                                                    filter?.[0]?.label ?? '',
                                                  )
                                                }}
                                                // customOnChange={onChange}
                                                isOptionDisabled={option =>
                                                  option.label ===
                                                    t('loading:device') ||
                                                  option.label ===
                                                    t('table:no_device')
                                                }
                                                noOptionsMessage={() =>
                                                  t('table:no_device')
                                                }
                                                loadingMessage={() =>
                                                  t('loading:device')
                                                }
                                                isLoading={deviceIsLoading}
                                                defaultValue={deviceSelectOptions?.find(
                                                  item =>
                                                    item.value ===
                                                    getValues(
                                                      `condition.${index}.device_id`,
                                                    ),
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
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </div>
                                        </FormItem>
                                      )}
                                    />
                                  )}
                                />
                              ) : (
                                <FormField
                                  control={control}
                                  name={`condition.${index}.device_name`}
                                  render={({
                                    field: { value, onChange, ...field },
                                  }) => (
                                    <FormItem>
                                      <FormLabel>
                                        {t(
                                          'cloud:org_manage.event_manage.add_event.condition.temp',
                                        )}
                                      </FormLabel>
                                      <div>
                                        <FormControl>
                                          <NewSelectDropdown
                                            classnamefieldwrapper="h-9"
                                            options={deviceNameOptions}
                                            customOnChange={value => {
                                              setValue(
                                                `condition.${index}.device_name`,
                                                value,
                                              )
                                              setValue(
                                                `condition.${index}.device_id`,
                                                'weather',
                                              )
                                            }}
                                            defaultValue={deviceNameOptions?.find(
                                              item =>
                                                item.value ===
                                                getValues(
                                                  `condition.${index}.device_name`,
                                                ),
                                            )}
                                            isOptionDisabled={option =>
                                              option.label ===
                                                t('loading:device') ||
                                              option.label ===
                                                t('table:no_device')
                                            }
                                            noOptionsMessage={() =>
                                              t('table:no_device')
                                            }
                                            loadingMessage={() =>
                                              t('loading:device')
                                            }
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              )}

                              <FormField
                                control={control}
                                name={`condition.${index}.attribute_name`}
                                render={({
                                  field: { value, onChange, ...field },
                                }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {t(
                                        'cloud:org_manage.event_manage.add_event.condition.attr',
                                      )}
                                    </FormLabel>
                                    <div>
                                      <FormControl>
                                        <NewSelectDropdown
                                          classnamefieldwrapper="h-9"
                                          options={
                                            watch('condition_event_type') ===
                                            'device_condition'
                                              ? attrSelectOptions
                                              : [
                                                  {
                                                    label: t(
                                                      'cloud:org_manage.event_manage.add_event.condition.temp',
                                                    ),
                                                    value: 'temp',
                                                  },
                                                ]
                                          }
                                          customOnChange={value =>
                                            setValue(
                                              `condition.${index}.attribute_name`,
                                              value,
                                            )
                                          }
                                          isOptionDisabled={option =>
                                            option.label ===
                                              t('loading:attr') ||
                                            option.label === t('table:no_attr')
                                          }
                                          noOptionsMessage={() =>
                                            t('table:no_attr')
                                          }
                                          loadingMessage={() =>
                                            t('loading:attr')
                                          }
                                          isLoading={attrIsLoading}
                                          onMenuOpen={() => {
                                            watch('condition_event_type') ===
                                              'device_condition' &&
                                              attrMutate({
                                                data: {
                                                  entity_ids: [
                                                    watch(
                                                      `condition.${index}.device_id`,
                                                    ),
                                                  ],
                                                  entity_type: 'DEVICE',
                                                },
                                              })
                                          }}
                                          defaultValue={
                                            watch('condition_event_type') ===
                                            'device_condition'
                                              ? {
                                                  label: getValues(
                                                    `condition.${index}.attribute_name`,
                                                  ),
                                                  value: getValues(
                                                    `condition.${index}.attribute_name`,
                                                  ),
                                                }
                                              : {
                                                  label: t(
                                                    'cloud:org_manage.event_manage.add_event.condition.temp',
                                                  ),
                                                  value: 'temp',
                                                }
                                          }
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </div>
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`condition.${index}.condition_type`}
                                render={({
                                  field: { onChange, value, ...field },
                                }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {t(
                                        'cloud:org_manage.event_manage.add_event.condition.condition_type.title',
                                      )}
                                    </FormLabel>
                                    <div>
                                      <Select
                                        {...field}
                                        onValueChange={onChange}
                                        value={value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {conditionTypeOptions?.map(type => (
                                            <SelectItem
                                              key={type.value}
                                              value={type.value}
                                            >
                                              {type.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </div>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`condition.${index}.operator`}
                                render={({
                                  field: { onChange, value, ...field },
                                }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {t(
                                        'cloud:org_manage.event_manage.add_event.condition.operator.title',
                                      )}
                                    </FormLabel>
                                    <div>
                                      <Select
                                        {...field}
                                        onValueChange={onChange}
                                        value={value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {operatorOptions?.map(option => (
                                            <SelectItem
                                              key={option.value}
                                              value={option.value}
                                            >
                                              {option.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </div>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={control}
                                name={`condition.${index}.threshold`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {t(
                                        'cloud:org_manage.event_manage.add_event.condition.threshold',
                                      )}
                                    </FormLabel>
                                    <div>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          {...field}
                                          autoFocus={false}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </div>
                                  </FormItem>
                                )}
                              />
                              <div className="flex justify-end">
                                <FormField
                                  control={form.control}
                                  name={`condition.${index}.logical_operator`}
                                  render={({
                                    field: { onChange, value, ...field },
                                  }) => (
                                    <FormItem className="flex-1">
                                      <FormLabel>
                                        {t(
                                          'cloud:org_manage.event_manage.add_event.condition.logical_operator.title',
                                        )}
                                      </FormLabel>
                                      <div>
                                        <Select
                                          {...field}
                                          onValueChange={onChange}
                                          value={value}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {logicalOperatorOption?.map(
                                              option => (
                                                <SelectItem
                                                  key={option.value}
                                                  value={option.value}
                                                >
                                                  {option.label}
                                                </SelectItem>
                                              ),
                                            )}
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </div>
                                    </FormItem>
                                  )}
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
                          <FormField
                            control={form.control}
                            name={`action.${index}.action_type`}
                            render={({
                              field: { onChange, value, ...field },
                            }) => (
                              <FormItem>
                                <FormLabel>
                                  {t(
                                    'cloud:org_manage.event_manage.add_event.action.action_type.title',
                                  )}
                                </FormLabel>
                                <div>
                                  <Select
                                    {...field}
                                    onValueChange={e => {
                                      onChange(e)
                                      setActionType(e)
                                    }}
                                    value={value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {(actionFields.length < 2
                                        ? actionTypeOptions
                                        : actionTypeOptions.filter(
                                            item => item.value !== 'report',
                                          )
                                      )?.map(option => (
                                        <SelectItem
                                          key={option.value}
                                          value={option.value}
                                        >
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />
                          {actionType === 'report' ? (
                            <FormField
                              control={form.control}
                              name="cmd.thing_id"
                              render={({
                                field: { value, onChange, ...field },
                              }) => (
                                <FormItem>
                                  <FormLabel>
                                    {t('cloud:custom_protocol.thing.id')}
                                  </FormLabel>
                                  <FormControl>
                                    <div>
                                      <NewSelectDropdown
                                        options={thingSelectData}
                                        customOnChange={value =>
                                          setValue('cmd.thing_id', value)
                                        }
                                        // customOnChange={onChange}
                                        isOptionDisabled={option =>
                                          option.label ===
                                            t('loading:entity_thing') ||
                                          option.label === t('table:no_thing')
                                        }
                                        noOptionsMessage={() =>
                                          t('table:no_thing')
                                        }
                                        loadingMessage={() =>
                                          t('loading:entity_thing')
                                        }
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
                                          ele =>
                                            ele.value === thingIdOptionProp,
                                        )}
                                        {...field}
                                      />
                                      <FormMessage />
                                    </div>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          ) : (
                            <div className="space-y-1">
                              <FormField
                                control={control}
                                name={`action.${index}.receiver`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {t(
                                        'cloud:org_manage.event_manage.add_event.action.address',
                                      )}
                                    </FormLabel>
                                    <div>
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                          {actionType === 'report' ? (
                            isLoadingService ? null : (
                              <FormField
                                control={form.control}
                                name="cmd.handle_service"
                                render={({
                                  field: { value, onChange, ...field },
                                }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {t('cloud:custom_protocol.service.title')}
                                    </FormLabel>
                                    <FormControl>
                                      <div>
                                        <NewSelectDropdown
                                          refSelect={selectDropdownServiceRef}
                                          options={serviceSelectData}
                                          customOnChange={value => {
                                            setValue(
                                              'cmd.handle_service',
                                              value,
                                            )
                                            resetField(
                                              `cmd.input.${index}.value`,
                                            )
                                          }}
                                          // customOnChange={onChange}
                                          isOptionDisabled={option =>
                                            option.label ===
                                              t('loading:service_thing') ||
                                            option.label ===
                                              t('table:no_service')
                                          }
                                          isLoading={
                                            watch('cmd.thing_id') != null
                                              ? isLoadingService
                                              : false
                                          }
                                          loadingMessage={() =>
                                            t('loading:service_thing')
                                          }
                                          noOptionsMessage={() =>
                                            t('table:no_service')
                                          }
                                          placeholder={t(
                                            'cloud:custom_protocol.service.choose',
                                          )}
                                          defaultValue={serviceSelectData?.find(
                                            ele =>
                                              ele.label === serviceOptionProp,
                                          )}
                                          {...field}
                                        />
                                        <FormMessage />
                                      </div>
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            )
                          ) : (
                            <div className="space-y-1">
                              <FormField
                                control={control}
                                name={`action.${index}.subject`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {t(
                                        'cloud:org_manage.event_manage.add_event.action.subject',
                                      )}
                                    </FormLabel>
                                    <div>
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </div>
                                  </FormItem>
                                )}
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
                                      <FormField
                                        control={control}
                                        name={`cmd.input.${index}.name`}
                                        disabled
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>
                                              {t(
                                                'cloud:custom_protocol.service.service_input.name',
                                              )}
                                            </FormLabel>
                                            <div>
                                              <FormControl>
                                                <Input
                                                  {...field}
                                                  defaultValue={element.name}
                                                />
                                              </FormControl>
                                              <FormMessage />
                                            </div>
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`cmd.input.${index}.type`}
                                        render={({
                                          field: { onChange, value, ...field },
                                        }) => (
                                          <FormItem className="flex-1">
                                            <FormLabel>
                                              {t(
                                                'cloud:custom_protocol.service.service_input.type',
                                              )}
                                            </FormLabel>
                                            <div>
                                              <Select
                                                {...field}
                                                disabled
                                                onValueChange={onChange}
                                                value={value}
                                                defaultValue={
                                                  element.type === 'string'
                                                    ? 'str'
                                                    : element.type
                                                }
                                              >
                                                <FormControl>
                                                  <SelectTrigger>
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                  {outputList?.map(option => (
                                                    <SelectItem
                                                      key={option.value}
                                                      value={option.value}
                                                    >
                                                      {option.label}
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                              <FormMessage />
                                            </div>
                                          </FormItem>
                                        )}
                                      />
                                      {watch(`cmd.input.${index}.type`) ===
                                      'bool' ? (
                                        <FormField
                                          control={control}
                                          name={`cmd.input.${index}.value`}
                                          render={({
                                            field: {
                                              onChange,
                                              value,
                                              ...field
                                            },
                                          }) => (
                                            <FormItem>
                                              <FormLabel>
                                                {t(
                                                  'cloud:custom_protocol.service.service_input.value',
                                                )}
                                              </FormLabel>
                                              <div>
                                                <FormControl>
                                                  <Checkbox
                                                    {...field}
                                                    checked={value as boolean}
                                                    onCheckedChange={onChange}
                                                    defaultChecked
                                                  />
                                                </FormControl>
                                                <FormMessage />
                                              </div>
                                            </FormItem>
                                          )}
                                        />
                                      ) : (
                                        <FormField
                                          control={control}
                                          name={`cmd.input.${index}.value`}
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>
                                                {t(
                                                  'cloud:custom_protocol.service.service_input.value',
                                                )}
                                              </FormLabel>
                                              <div>
                                                <FormControl>
                                                  <Input
                                                    type={
                                                      ['json', 'str'].includes(
                                                        watch(
                                                          `cmd.input.${index}.type`,
                                                        ),
                                                      )
                                                        ? 'text'
                                                        : 'number'
                                                    }
                                                    defaultValue={
                                                      inputDataProp?.[
                                                        element.name
                                                      ]
                                                    }
                                                    {...field}
                                                  />
                                                </FormControl>
                                                <FormMessage />
                                              </div>
                                            </FormItem>
                                          )}
                                        />
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <FormField
                                control={control}
                                name={`action.${index}.message`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {t(
                                        'cloud:org_manage.event_manage.add_event.action.message',
                                      )}
                                    </FormLabel>
                                    <div>
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </div>
                                  </FormItem>
                                )}
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
