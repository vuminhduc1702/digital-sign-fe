import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useEffect, useMemo, useRef, useState } from 'react'
import ColorPicker from 'react-pick-color'

import { FormDialog } from '@/components/FormDialog'
import { Button } from '@/components/Button'
import {
  type Widget,
  type WidgetCreate,
  widgetCreateSchema,
  type widgetSchema,
  widgetDataTypeOptions,
  wsInterval,
  widgetAgg,
} from './CreateWidget'
import { Spinner } from '@/components/Spinner'
import TitleBar from '@/components/Head/TitleBar'
import {
  FieldWrapper,
  InputField,
  SelectDropdown,
  SelectField,
  type SelectOption,
} from '@/components/Form'
import { useGetOrgs } from '@/layout/MainLayout/api'
import { cn, flattenData } from '@/utils/misc'
import { useDefaultCombobox } from '@/utils/hooks'
import { useGetDevices } from '@/cloud/orgManagement/api/deviceAPI'
import storage from '@/utils/storage'
import { useCreateAttrChart } from '../../api'

import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { EditBtnIcon, PlusIcon } from '@/components/SVGIcons'
import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar, TimePicker } from '@/components/Calendar'
import { useParams } from 'react-router-dom'
import { type SelectInstance } from 'react-select'
import {
  WS_REALTIME_PERIOD,
  WS_REALTIME_INTERVAL,
  WS_REALTIME_REF,
} from './CreateWidget'
import { nameSchema } from '@/utils/schemaValidation'
import i18n from '@/i18n'
import { widgetTypeSchema, attrWidgetSchema } from './CreateWidget'
import { SelectSuperordinateOrgTree } from '@/components/SelectSuperordinateOrgTree'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover'

export function UpdateWidget({
  widgetInfo,
  setWidgetList,
  widgetId,
}: {
  widgetInfo?: z.infer<typeof widgetSchema>
  setWidgetList: React.Dispatch<React.SetStateAction<Widget>>
  widgetId: string
}) {
  const { t } = useTranslation()

  const projectId = storage.getProject()?.id
  const { orgId } = useParams()

  const colorPickerRef = useRef()
  const [isDone, setIsDone] = useState(false)

  const widgetInfoMemo = useMemo(() => widgetInfo, [widgetInfo])

  const initParse =
    widgetInfoMemo?.datasource?.init_message &&
    JSON.parse(widgetInfoMemo?.datasource?.init_message)

  const selectDropdownDeviceRef = useRef<SelectInstance<SelectOption[]> | null>(
    null,
  )
  const selectDropdownAttributeConfigRef = useRef<SelectInstance<
    SelectOption[]
  > | null>(null)

  const [fetchData, setFetchData] = useState(false)

  const attrSelectDataForMap = [
    { value: 'latitude', label: 'latitude' },
    { value: 'longitude', label: 'longitude' },
  ]

  // map schema
  const mapWidgetSchema = z.object({
    title: nameSchema,
    type: widgetTypeSchema,
    org_id: z.string({
      required_error: i18n.t('cloud:org_manage.org_manage.add_org.choose_org'),
    }),
    device: z.array(
      z.string({
        required_error: i18n.t(
          'cloud:org_manage.device_manage.add_device.choose_device',
        ),
      }),
      {
        required_error: i18n.t(
          'cloud:org_manage.device_manage.add_device.choose_device',
        ),
      },
    ),
    attributeConfig: attrWidgetSchema,
    widgetSetting: z
      .object({
        window: z.number().optional(),
      })
      .and(
        z.discriminatedUnion('agg', [
          z.object({
            agg: z.literal('NONE'),
            data_point: z
              .number()
              .min(7, { message: 'Tối thiểu 7 data point' })
              .max(5000, { message: 'Tối đa 5000 data point' }),
          }),
          z.object({
            agg: z.enum(
              ['AVG', 'MIN', 'MAX', 'SUM', 'COUNT', 'SMA', 'FFT'] as const,
              {
                errorMap: () => ({ message: i18n.t('ws:filter.choose_agg') }),
              },
            ),
            interval: z
              .number({
                required_error: i18n.t('ws:filter.choose_group_interval'),
              })
              .optional(),
          }),
        ]),
      )
      .and(
        z
          .discriminatedUnion('dataType', [
            z.object({
              dataType: z.literal('HISTORY'),
              startDate: z.date({
                required_error: i18n.t(
                  'cloud:dashboard.config_chart.pick_date_alert',
                ),
              }),
              endDate: z.date({
                required_error: i18n.t(
                  'cloud:dashboard.config_chart.pick_date_alert',
                ),
              }),
            }),
            z.object({
              dataType: z.literal('REALTIME'),
              time_period: z.number({
                required_error: i18n.t('ws:filter.choose_time_period'),
              }),
            }),
          ])
          .optional(),
      )
      .optional(),
    id: z.string().optional(),
  })

  function handleSchema() {
    if (widgetInfoMemo?.description === 'MAP') {
      return mapWidgetSchema
    }
    return widgetCreateSchema
  }

  const widgetSchema = handleSchema()

  const form = useForm<WidgetCreate>({
    resolver: widgetSchema && zodResolver(widgetSchema),
    defaultValues: {
      title: widgetInfoMemo?.title,
      org_id: widgetInfoMemo?.datasource?.org_id
        ? JSON.parse(widgetInfoMemo?.datasource?.org_id)
        : '',
      device: initParse?.entityDataCmds[0]?.query?.entityFilter?.entityIds,
      attributeConfig: widgetInfoMemo?.attribute_config,
      widgetSetting: {
        agg: widgetInfoMemo?.config?.aggregation || 'AVG',
        dataType: widgetInfoMemo?.config?.chartsetting?.data_type || 'REALTIME',
        time_period: widgetInfoMemo?.config?.chartsetting?.time_period || 0,
        interval: widgetInfoMemo?.config?.timewindow?.interval || 0,
        data_point: widgetInfoMemo?.config?.chartsetting?.data_point,
        startDate: new Date(
          widgetInfoMemo?.config?.chartsetting?.start_date ?? 0,
        ),
        endDate: new Date(widgetInfoMemo?.config?.chartsetting?.end_date ?? 0),
      },
    },
  })
  const {
    register,
    formState,
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    reset,
  } = form

  const { fields, append, remove } = useFieldArray({
    name: 'attributeConfig',
    control: control,
  })

  const { data: orgData, isLoading: orgIsLoading } = useGetOrgs({
    projectId,
  })

  const { data: deviceData, isLoading: deviceIsLoading } = useGetDevices({
    orgId: watch('org_id') || orgId,
    projectId,
    config: {
      suspense: false,
    },
  })
  const deviceSelectData = deviceData?.devices.map(
    (device: { id: string; name: string }) => ({
      value: device.id,
      label: device.name,
    }),
  )

  const getDeviceInfo = (id: string) => {
    const device = deviceData?.devices.find(device => device.id === id) as {
      name: string
      id: string
    }
    return device?.name + ' - ' + device?.id
  }

  const {
    data: attrChartData,
    mutate: attrChartMutate,
    isLoading: attrChartIsLoading,
  } = useCreateAttrChart()
  const attrSelectData = attrChartData?.entities?.flatMap(item => {
    const result = item?.attr_keys?.map(attr => ({
      deviceId: item?.entity_id,
      label: attr,
      value: attr,
    }))
    return result
  })

  useEffect(() => {
    if (!fetchData) return
    attrChartMutate({
      data: {
        entity_ids: watch('device') || [],
        entity_type: 'DEVICE',
        version_two: true,
      },
    })
  }, [fetchData])

  // remove duplicate in attrSelectData
  function removeDup(
    array:
      | Array<{ label: string; value: string; deviceId: string }>
      | undefined,
  ) {
    if (!array) return
    // remove duplicate element
    const result = array.filter((item, index) => {
      return (
        array.findIndex(
          item2 => item2?.label === item?.label && item2?.value === item?.value,
        ) === index
      )
    })
    return result
  }

  const setDeviceOption = (attribute: string) => {
    const result: Array<{
      value: string
      label: string
    }> = []
    attrChartData?.entities?.map(item => {
      item?.attr_keys?.map(attr => {
        if (attr === attribute) {
          const deviceInfo = getDeviceInfo(item.entity_id)
          if (deviceInfo.includes('undefined')) return
          result.push({
            value: item.entity_id,
            label: deviceInfo,
          })
        }
      })
    })
    return result
  }

  function intervalOptionHandler(timePeriod: number) {
    const timePeriodPosition = WS_REALTIME_PERIOD.findIndex(
      period => period.value === timePeriod,
    )
    if (timePeriodPosition === -1) return
    const timePeriodRef = WS_REALTIME_REF[timePeriodPosition]

    // get the start and end position in WS_REALTIME_INTERVAL from WS_REALTIME_REF
    const start = timePeriodRef.start
    const end = timePeriodRef.end

    const intervalOptions = WS_REALTIME_INTERVAL.slice(start, end + 1)
    return intervalOptions.map(interval => ({
      label: interval.label,
      value: interval.value,
    }))
  }

  useEffect(() => {
    const defaultOption =
      intervalOptionHandler(watch('widgetSetting.time_period')) || []
    if (defaultOption.length > 0) {
      setValue('widgetSetting.interval', defaultOption[0].value)
    }
  }, [watch('widgetSetting.time_period')])

  return (
    <FormDialog
      size="max"
      title={
        widgetInfo?.description === 'LINE'
          ? t('cloud:dashboard.config_chart.update_line')
          : widgetInfo?.description === 'BAR'
            ? t('cloud:dashboard.config_chart.update_bar')
            : widgetInfo?.description === 'TABLE'
              ? t('cloud:dashboard.config_chart.update_table')
              : widgetInfo?.description === 'PIE'
                ? t('cloud:dashboard.config_chart.update_pie')
                : widgetInfo?.description === 'GAUGE'
                  ? t('cloud:dashboard.config_chart.update_gauge')
                  : widgetInfo?.description === 'CARD'
                    ? t('cloud:dashboard.config_chart.update_card')
                    : widgetInfo?.description === 'MAP'
                      ? t('cloud:dashboard.config_chart.update_card')
                      : t('cloud:dashboard.config_chart.update')
      }
      isDone={isDone}
      body={
        <Form {...form}>
          <form
            id="update-widget"
            className="flex w-full flex-col justify-between space-y-5"
            onSubmit={handleSubmit(values => {
              const attrData = values.attributeConfig.map(item => ({
                type: 'TIME_SERIES',
                key: item.attribute_key,
              }))
              const initMessage = {
                entityDataCmds: [
                  {
                    query: {
                      entityFilter: {
                        type: 'entityList',
                        entityType: 'DEVICE',
                        entityIds: values.device,
                      },
                      pageLink: {
                        pageSize: 1,
                        page: 0,
                        sortOrder: {
                          key: {
                            type: 'ENTITY_FIELD',
                            key: 'ts',
                          },
                          direction: 'DESC',
                        },
                      },
                      entityFields: [
                        {
                          type: 'ENTITY_FIELD',
                          key: 'name',
                        },
                      ],
                      latestValues: attrData,
                    },
                    requestType: 'INIT',
                    id: widgetId,
                  },
                ],
              }

              const lastestMessage = {
                entityDataCmds: [
                  {
                    latestCmd: {
                      keys: attrData,
                    },
                    id: widgetId,
                  },
                ],
              }

              const tsCmd = {
                keys: values.attributeConfig.map(item => item.attribute_key),
                interval:
                  values.widgetSetting?.agg !== 'NONE'
                    ? values.widgetSetting?.interval
                    : undefined,
                offset: 0,
                agg: values.widgetSetting?.agg,
              }
              const realtimeMessage =
                values.widgetSetting?.agg === 'NONE'
                  ? {
                      entityDataCmds: [
                        {
                          tsCmd: {
                            ...tsCmd,
                            limit: values.widgetSetting?.data_point,
                          },
                          id: widgetId,
                        },
                      ],
                    }
                  : {
                      entityDataCmds: [
                        {
                          tsCmd: {
                            ...tsCmd,
                            startTs:
                              values.widgetSetting?.dataType === 'REALTIME'
                                ? Date.now() - values.widgetSetting?.time_period
                                : undefined,
                          },
                          id: widgetId,
                        },
                      ],
                    }

              const historyCmd = {
                keys: values.attributeConfig.map(item => item.attribute_key),
                startTs:
                  Date.parse(
                    values.widgetSetting?.dataType === 'HISTORY'
                      ? values.widgetSetting?.startDate?.toISOString()
                      : '',
                  ) || undefined,
                endTs:
                  Date.parse(
                    values.widgetSetting?.dataType === 'HISTORY'
                      ? values.widgetSetting?.endDate?.toISOString()
                      : '',
                  ) || undefined,
                interval:
                  values.widgetSetting?.agg !== 'NONE'
                    ? values.widgetSetting?.interval
                    : undefined,
                limit: 5000,
                offset: 0,
                agg: values.widgetSetting?.agg,
              }
              const historyMessage =
                values.widgetSetting?.agg === 'SMA'
                  ? {
                      entityDataCmds: [
                        {
                          historyCmd: {
                            ...historyCmd,
                            window: values.widgetSetting?.window,
                          },
                          id: widgetId,
                        },
                      ],
                    }
                  : {
                      entityDataCmds: [
                        {
                          historyCmd,
                          id: widgetId,
                        },
                      ],
                    }

              const widget: z.infer<typeof widgetSchema> = {
                title: values.title,
                description: widgetInfoMemo?.description || 'LINE',
                type: widgetInfoMemo?.type,
                datasource: {
                  init_message: JSON.stringify(initMessage),
                  lastest_message:
                    widgetInfoMemo?.type === 'LASTEST'
                      ? JSON.stringify(lastestMessage)
                      : '',
                  realtime_message:
                    values.widgetSetting?.dataType === 'REALTIME'
                      ? JSON.stringify(realtimeMessage)
                      : '',
                  history_message:
                    values.widgetSetting?.dataType === 'HISTORY'
                      ? JSON.stringify(historyMessage)
                      : '',
                  org_id: JSON.stringify(values.org_id),
                },
                attribute_config: values.attributeConfig.map(item => ({
                  attribute_key: item.attribute_key,
                  color: item.color,
                  max: item.max,
                  min: item.min || 0,
                  label: item.label,
                  unit: item.unit,
                })),
                config:
                  widgetInfoMemo?.type === 'TIMESERIES'
                    ? {
                        aggregation: values.widgetSetting?.agg,
                        timewindow: {
                          interval:
                            values.widgetSetting?.agg !== 'NONE'
                              ? values.widgetSetting?.interval
                              : undefined,
                        },
                        chartsetting: {
                          start_date: new Date(
                            values.widgetSetting?.dataType === 'HISTORY'
                              ? values.widgetSetting?.startDate?.toISOString()
                              : 0,
                          ).getTime(),
                          end_date: new Date(
                            values.widgetSetting?.dataType === 'HISTORY'
                              ? values.widgetSetting?.endDate?.toISOString()
                              : 0,
                          ).getTime(),
                          data_type: values.widgetSetting?.dataType,
                          data_point:
                            values.widgetSetting?.agg === 'NONE'
                              ? values.widgetSetting?.data_point
                              : undefined,
                          time_period:
                            values.widgetSetting?.dataType === 'REALTIME'
                              ? values.widgetSetting?.time_period
                              : undefined,
                        },
                      }
                    : null,
              }

              setWidgetList(prev => ({ ...prev, ...{ [widgetId]: widget } }))

              // close the dialog
              setInterval(() => {
                setIsDone(true)
              }, 100)
              setIsDone(false)
            })}
          >
            <>
              {orgIsLoading ? (
                <div className="flex grow items-center justify-center">
                  <Spinner showSpinner size="xl" />
                </div>
              ) : (
                <>
                  <TitleBar
                    title={t('cloud:dashboard.config_chart.show')}
                    className="w-full rounded-md bg-secondary-700 pl-3"
                  />
                  <div className="grid grid-cols-1 gap-x-4 px-2 md:grid-cols-3">
                    <InputField
                      label={t('cloud:dashboard.config_chart.name')}
                      error={formState.errors['title']}
                      registration={register('title')}
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
                                      customOnChange={() => {
                                        selectDropdownDeviceRef.current?.clearValue()
                                        selectDropdownAttributeConfigRef.current?.clearValue()
                                      }}
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

                    <div className="space-y-1">
                      <SelectDropdown
                        refSelect={selectDropdownDeviceRef}
                        label={t('cloud:dashboard.config_chart.device')}
                        name="device"
                        control={control}
                        options={deviceSelectData}
                        isOptionDisabled={option =>
                          option.label === t('loading:device') ||
                          option.label === t('table:no_device')
                        }
                        noOptionsMessage={() => t('table:no_device')}
                        loadingMessage={() => t('loading:device')}
                        isLoading={deviceIsLoading}
                        isMulti={
                          !(
                            widgetInfoMemo?.description === 'GAUGE' ||
                            widgetInfoMemo?.description === 'CARD'
                          )
                        }
                        closeMenuOnSelect={
                          widgetInfoMemo?.description === 'GAUGE' ||
                          widgetInfoMemo?.description === 'CARD'
                        }
                        isWrappedArray
                        customOnChange={option => {
                          if (option != null) {
                            attrChartMutate({
                              data: {
                                entity_ids: option,
                                entity_type: 'DEVICE',
                                version_two: true,
                              },
                            })
                            // removeField(option)
                          }
                        }}
                        handleClearSelectDropdown={() => {
                          selectDropdownAttributeConfigRef.current?.clearValue()
                        }}
                        handleChangeSelect={() => {
                          selectDropdownAttributeConfigRef.current?.clearValue()
                        }}
                        defaultValue={deviceSelectData?.filter(item =>
                          getValues('device')?.includes(item.value),
                        )}
                      />
                      <p className="text-body-sm text-primary-400">
                        {formState?.errors?.device?.message ??
                          formState?.errors?.device?.[0]?.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between space-x-3">
                    <TitleBar
                      title={t(
                        'cloud:dashboard.detail_dashboard.add_widget.data_chart',
                      )}
                      className="w-full rounded-md bg-secondary-700 pl-3"
                    />
                    {!(
                      widgetInfoMemo?.description === 'GAUGE' ||
                      widgetInfoMemo?.description === 'CARD'
                    ) ? (
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
                        onClick={() =>
                          append({
                            attribute_key: '',
                            label: '',
                            color: '',
                            unit: '',
                            max: 100,
                            min: 0,
                          })
                        }
                      />
                    ) : null}
                  </div>

                  {fields.map((field, index) => (
                    <section
                      className="!mt-2 flex justify-between gap-x-2"
                      key={field.id}
                    >
                      <div className="grid w-full grid-cols-1 gap-x-4 px-2 md:grid-cols-4">
                        <div className="w-full">
                          {widgetInfoMemo?.description === 'MAP' ? (
                            <SelectDropdown
                              label={t('cloud:dashboard.config_chart.attr')}
                              name={`attributeConfig.${index}.attribute_key`}
                              control={control}
                              options={attrSelectDataForMap}
                              isOptionDisabled={option =>
                                option.label === t('loading:input') ||
                                option.label === t('table:no_attr')
                              }
                              noOptionsMessage={() => t('table:no_attr')}
                              loadingMessage={() => t('loading:attr')}
                              isLoading={attrChartIsLoading}
                              placeholder={t(
                                'cloud:org_manage.org_manage.add_attr.choose_attr',
                              )}
                              defaultValue={{
                                label:
                                  widgetInfoMemo?.attribute_config[index]
                                    ?.attribute_key,
                                value:
                                  widgetInfoMemo?.attribute_config[index]
                                    ?.attribute_key,
                              }}
                              error={
                                formState?.errors?.attributeConfig?.[index]
                                  ?.attribute_key
                              }
                            />
                          ) : (
                            <SelectDropdown
                              // refSelect={selectDropdownAttributeConfigRef}
                              label={t('cloud:dashboard.config_chart.attr')}
                              name={`attributeConfig.${index}.attribute_key`}
                              control={control}
                              options={removeDup(attrSelectData)}
                              isOptionDisabled={option =>
                                option.label === t('loading:input') ||
                                option.label === t('table:no_attr')
                              }
                              noOptionsMessage={() => t('table:no_attr')}
                              loadingMessage={() => t('loading:attr')}
                              isLoading={attrChartIsLoading}
                              placeholder={t(
                                'cloud:org_manage.org_manage.add_attr.choose_attr',
                              )}
                              defaultValue={{
                                label:
                                  widgetInfoMemo?.attribute_config[index]
                                    ?.attribute_key,
                                value:
                                  widgetInfoMemo?.attribute_config[index]
                                    ?.attribute_key,
                              }}
                              error={
                                formState?.errors?.attributeConfig?.[index]
                                  ?.attribute_key
                              }
                            />
                          )}
                        </div>
                        {!watch(`attributeConfig.${index}.attribute_key`) ||
                        widgetInfoMemo?.description === 'GAUGE' ||
                        widgetInfoMemo?.description === 'CARD' ? null : (
                          <SelectDropdown
                            name={`attributeConfig.${index}.label`}
                            label={t('cloud:dashboard.config_chart.label')}
                            error={
                              formState?.errors?.attributeConfig?.[index]?.label
                            }
                            control={control}
                            options={setDeviceOption(
                              watch(`attributeConfig.${index}.attribute_key`),
                            )}
                            isLoading={attrChartIsLoading}
                            defaultValue={
                              widgetInfoMemo?.attribute_config[index]?.label
                                ? {
                                    value:
                                      widgetInfoMemo?.attribute_config[index]
                                        ?.label,
                                    label:
                                      widgetInfoMemo?.attribute_config[index]
                                        ?.deviceName +
                                      ' - ' +
                                      widgetInfoMemo?.attribute_config[index]
                                        ?.label,
                                  }
                                : null
                            }
                          />
                        )}
                        {!['GAUGE', 'TABLE', 'MAP', 'CONTROLLER', 'CARD'].find(
                          e => widgetInfoMemo?.description === e,
                        ) ? (
                          <div className="space-y-1">
                            <FieldWrapper
                              label={t('cloud:dashboard.config_chart.color')}
                              error={
                                formState?.errors?.attributeConfig?.[index]
                                  ?.color
                              }
                            >
                              <Controller
                                control={control}
                                name={`attributeConfig.${index}.color`}
                                render={({
                                  field: { onChange, value, ...field },
                                }) => {
                                  return (
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          className="relative h-9 w-full rounded-md"
                                          variant="trans"
                                          size="square"
                                        >
                                          <div
                                            className="w-[10px] "
                                            style={{
                                              backgroundColor: `${value}`,
                                            }}
                                          ></div>
                                          {value}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                      >
                                        <ColorPicker
                                          {...field}
                                          color={value}
                                          onChange={(color: {
                                            rgb: {
                                              r: number
                                              g: number
                                              b: number
                                              a: number
                                            }
                                          }) => {
                                            const rgb = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`
                                            onChange(rgb)
                                          }}
                                          // @ts-expect-error: ColorPicker don't have ref prop
                                          ref={colorPickerRef}
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  )
                                }}
                              />
                            </FieldWrapper>
                          </div>
                        ) : null}
                        <InputField
                          label={t('cloud:dashboard.config_chart.unit')}
                          error={
                            formState?.errors?.attributeConfig?.[index]?.unit
                          }
                          registration={register(
                            `attributeConfig.${index}.unit` as const,
                          )}
                        />
                        {widgetInfoMemo?.description === 'GAUGE' && (
                          <>
                            <InputField
                              label={t('cloud:dashboard.config_chart.min')}
                              error={
                                formState?.errors?.attributeConfig?.[index]?.min
                              }
                              type="number"
                              registration={register(
                                `attributeConfig.${index}.min` as const,
                                { valueAsNumber: true },
                              )}
                            />
                            <InputField
                              label={t('cloud:dashboard.config_chart.max')}
                              error={
                                formState?.errors?.attributeConfig?.[index]?.max
                              }
                              type="number"
                              registration={register(
                                `attributeConfig.${index}.max` as const,
                                { valueAsNumber: true },
                              )}
                            />
                          </>
                        )}
                      </div>
                      {!(
                        widgetInfoMemo?.description === 'GAUGE' ||
                        widgetInfoMemo?.description === 'CARD'
                      ) ? (
                        <Button
                          type="button"
                          size="square"
                          variant="none"
                          className="self-start p-2 pt-3"
                          onClick={() => remove(index)}
                          startIcon={
                            <img
                              src={btnDeleteIcon}
                              alt="Delete widget attribute"
                              className="h-10 w-10"
                            />
                          }
                        />
                      ) : null}
                    </section>
                  ))}

                  {widgetInfoMemo?.type === 'TIMESERIES' ? (
                    <>
                      <TitleBar
                        title={t('cloud:dashboard.config_chart.widget_config')}
                        className="w-full rounded-md bg-secondary-700 pl-3"
                      />
                      <div className="grid grid-cols-1 gap-x-4 gap-y-3 px-2 md:grid-cols-4">
                        <SelectField
                          label={t('ws:filter.dataType')}
                          error={formState?.errors?.widgetSetting?.dataType}
                          registration={register(
                            `widgetSetting.dataType` as const,
                            {
                              value: 'REALTIME',
                            },
                          )}
                          options={widgetDataTypeOptions.map(dataType => ({
                            label: dataType.label,
                            value: dataType.value,
                          }))}
                        />
                        <SelectField
                          label={t('ws:filter.data_aggregation')}
                          error={formState?.errors?.widgetSetting?.agg}
                          registration={register(`widgetSetting.agg` as const, {
                            value: 'AVG',
                          })}
                          options={
                            getValues('widgetSetting.dataType') === 'HISTORY'
                              ? widgetAgg
                                  .map(agg => ({
                                    label: agg.label,
                                    value: agg.value,
                                  }))
                                  .concat([
                                    { label: 'SMA', value: 'SMA' },
                                    { label: 'FFT', value: 'FFT' },
                                  ])
                              : widgetAgg.map(agg => ({
                                  label: agg.label,
                                  value: agg.value,
                                }))
                          }
                        />
                        {watch('widgetSetting.agg') === 'NONE' ? (
                          <InputField
                            type="number"
                            label={t('ws:filter.data_point')}
                            // @ts-expect-error: https://stackoverflow.com/questions/74219465/typescript-react-hook-form-error-handling-with-zod-union-schema
                            error={formState?.errors?.widgetSetting?.data_point}
                            registration={register(
                              `widgetSetting.data_point` as const,
                              {
                                valueAsNumber: true,
                              },
                            )}
                          />
                        ) : watch('widgetSetting.dataType') === 'HISTORY' ? (
                          <SelectField
                            label={t('ws:filter.group_interval')}
                            // @ts-expect-error: https://stackoverflow.com/questions/74219465/typescript-react-hook-form-error-handling-with-zod-union-schema
                            error={formState?.errors?.widgetSetting?.interval}
                            registration={register(
                              `widgetSetting.interval` as const,
                              {
                                valueAsNumber: true,
                              },
                            )}
                            options={wsInterval.map(interval => ({
                              label: interval.label,
                              value: interval.value,
                            }))}
                          />
                        ) : (
                          <SelectField
                            label={t('ws:filter.time_period')}
                            // @ts-expect-error: https://stackoverflow.com/questions/74219465/typescript-react-hook-form-error-handling-with-zod-union-schema
                            error={
                              formState?.errors?.widgetSetting?.time_period
                            }
                            registration={register(
                              `widgetSetting.time_period` as const,
                              {
                                valueAsNumber: true,
                              },
                            )}
                            options={WS_REALTIME_PERIOD.map(interval => ({
                              label: interval.label,
                              value: interval.value,
                            }))}
                          />
                        )}

                        {watch('widgetSetting.agg') === 'SMA' ? (
                          <InputField
                            type="number"
                            label={t('ws:filter.sma_window')}
                            error={formState?.errors?.widgetSetting?.window}
                            registration={register(
                              `widgetSetting.window` as const,
                              {
                                valueAsNumber: true,
                              },
                            )}
                          />
                        ) : null}

                        {watch('widgetSetting.dataType') === 'HISTORY' ? (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <FieldWrapper
                                label={t(
                                  'cloud:dashboard.config_chart.startDate',
                                )}
                                error={
                                  // @ts-expect-error: https://stackoverflow.com/questions/74219465/typescript-react-hook-form-error-handling-with-zod-union-schema
                                  formState?.errors?.widgetSetting?.startDate
                                }
                              >
                                <Controller
                                  control={control}
                                  name="widgetSetting.startDate"
                                  render={({
                                    field: { onChange, value, ...field },
                                  }) => {
                                    return (
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            id="date"
                                            variant="trans"
                                            size="square"
                                            className={cn(
                                              'relative w-full !justify-start rounded-md text-left font-normal focus:outline-2 focus:outline-offset-0 focus:outline-focus-400 focus:ring-focus-400',
                                              !value && 'text-secondary-700',
                                            )}
                                          >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {value ? (
                                              <span>
                                                {format(
                                                  new Date(value),
                                                  'dd/MM/y HH:mm:ss',
                                                )}
                                              </span>
                                            ) : (
                                              <span>
                                                {t(
                                                  'cloud:dashboard.config_chart.pick_date',
                                                )}
                                              </span>
                                            )}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                          className="w-auto p-0"
                                          align="start"
                                        >
                                          <Calendar
                                            {...field}
                                            initialFocus
                                            mode="single"
                                            defaultMonth={new Date()}
                                            selected={value}
                                            onSelect={onChange}
                                            numberOfMonths={1}
                                          />
                                          <TimePicker
                                            granularity="second"
                                            onChange={e =>
                                              setValue(
                                                'widgetSetting.startDate',
                                                new Date(
                                                  new Date(
                                                    getValues(
                                                      'widgetSetting.startDate',
                                                    ),
                                                  ).setHours(0, 0, 0, 0) +
                                                    e.hour * 60 * 60 * 1000 +
                                                    e.minute * 60 * 1000 +
                                                    e.second * 1000 +
                                                    e.millisecond,
                                                ),
                                              )
                                            }
                                            hourCycle={24}
                                            isDisabled={
                                              !watch('widgetSetting.startDate')
                                            }
                                          />
                                        </PopoverContent>
                                      </Popover>
                                    )
                                  }}
                                />
                              </FieldWrapper>
                            </div>

                            <div className="space-y-1">
                              <FieldWrapper
                                label={t(
                                  'cloud:dashboard.config_chart.endDate',
                                )}
                                error={
                                  getValues('widgetSetting.dataType') ===
                                  'REALTIME'
                                    ? ''
                                    : // @ts-expect-error: https://stackoverflow.com/questions/74219465/typescript-react-hook-form-error-handling-with-zod-union-schema
                                      formState?.errors?.widgetSetting?.endDate
                                }
                              >
                                <Controller
                                  control={control}
                                  name="widgetSetting.endDate"
                                  render={({
                                    field: { onChange, value, ...field },
                                  }) => {
                                    return (
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            id="date"
                                            variant="trans"
                                            size="square"
                                            className={cn(
                                              'relative w-full !justify-start rounded-md text-left font-normal',
                                              !value && 'text-secondary-700',
                                            )}
                                            disabled={
                                              getValues(
                                                'widgetSetting.dataType',
                                              ) === 'REALTIME'
                                            }
                                          >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {value ? (
                                              <span>
                                                {format(
                                                  new Date(value),
                                                  'dd/MM/y HH:mm:ss',
                                                )}
                                              </span>
                                            ) : (
                                              <span>
                                                {t(
                                                  'cloud:dashboard.config_chart.pick_date',
                                                )}
                                              </span>
                                            )}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                          className="w-auto p-0"
                                          align="start"
                                        >
                                          <Calendar
                                            {...field}
                                            initialFocus
                                            mode="single"
                                            defaultMonth={new Date()}
                                            selected={value}
                                            onSelect={onChange}
                                            numberOfMonths={1}
                                            disabled={{
                                              before: watch(
                                                'widgetSetting.startDate',
                                              ),
                                            }}
                                          />
                                          <TimePicker
                                            granularity="second"
                                            onChange={e =>
                                              setValue(
                                                'widgetSetting.endDate',
                                                new Date(
                                                  new Date(
                                                    getValues(
                                                      'widgetSetting.endDate',
                                                    ) as unknown as Date,
                                                  ).setHours(0, 0, 0, 0) +
                                                    e.hour * 60 * 60 * 1000 +
                                                    e.minute * 60 * 1000 +
                                                    e.second * 1000 +
                                                    e.millisecond,
                                                ),
                                              )
                                            }
                                            hourCycle={24}
                                            isDisabled={
                                              !watch('widgetSetting.endDate')
                                            }
                                          />
                                        </PopoverContent>
                                      </Popover>
                                    )
                                  }}
                                />
                              </FieldWrapper>
                            </div>
                          </div>
                        ) : (
                          <SelectField
                            label={t('ws:filter.group_interval')}
                            // @ts-expect-error: https://stackoverflow.com/questions/74219465/typescript-react-hook-form-error-handling-with-zod-union-schema
                            error={formState?.errors?.widgetSetting?.interval}
                            registration={register(
                              `widgetSetting.interval` as const,
                              {
                                valueAsNumber: true,
                              },
                            )}
                            options={intervalOptionHandler(
                              watch('widgetSetting.time_period'),
                            )}
                          />
                        )}
                      </div>
                    </>
                  ) : null}
                </>
              )}
            </>
          </form>
        </Form>
      }
      triggerButton={
        <Button
          className="h-5 w-5 hover:text-primary-400"
          variant="none"
          size="square"
          startIcon={<EditBtnIcon width={20} height={17} viewBox="0 0 20 17" />}
          onClick={() => {
            setFetchData(true)
          }}
        />
      }
      confirmButton={
        <Button
          form="update-widget"
          type="submit"
          size="md"
          className="rounded-md border bg-primary-400"
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    />
  )
}
