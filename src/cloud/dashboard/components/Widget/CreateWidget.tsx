import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { useEffect, useRef } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import ColorPicker from 'react-pick-color'
import { useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import * as z from 'zod'

import { useGetDevices } from '~/cloud/orgManagement/api/deviceAPI'
import { Button } from '~/components/Button'
import { Calendar, TimePicker } from '~/components/Calendar'
import { Dialog, DialogTitle } from '~/components/Dialog'
import {
  FieldWrapper,
  InputField,
  SelectDropdown,
  SelectField,
  type SelectOption,
} from '~/components/Form'
import TitleBar from '~/components/Head/TitleBar'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/Popover'
import { Spinner } from '~/components/Spinner'
import i18n from '~/i18n'
import { useGetOrgs } from '~/layout/MainLayout/api'
import { cn } from '~/utils/misc'
import storage from '~/utils/storage'
import { useCreateAttrChart } from '../../api'

import { type SelectInstance } from 'react-select'
import { nameSchema } from '~/utils/schemaValidation'
import { aggSchema, widgetCategorySchema, type WidgetType } from '../../types'

import { HiOutlineXMark } from 'react-icons/hi2'
import { LuCalendar } from 'react-icons/lu'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { PlusIcon } from '~/components/SVGIcons'
import { ComplexTree } from '~/components/ComplexTree'

export const WS_REALTIME_PERIOD = [
  {
    label: i18n.t('ws:filter.time_period_value.10second'),
    value: 10 * 1000,
  },
  {
    label: i18n.t('ws:filter.time_period_value.15second'),
    value: 15 * 1000,
  },
  {
    label: i18n.t('ws:filter.time_period_value.30second'),
    value: 30 * 1000,
  },
  {
    label: i18n.t('ws:filter.time_period_value.1minute'),
    value: 60 * 1000,
  },
  {
    label: i18n.t('ws:filter.time_period_value.2minute'),
    value: 2 * 60 * 1000,
  },
  {
    label: i18n.t('ws:filter.time_period_value.5minute'),
    value: 5 * 60 * 1000,
  },
  {
    label: i18n.t('ws:filter.time_period_value.10minute'),
    value: 10 * 60 * 1000,
  },
  {
    label: i18n.t('ws:filter.time_period_value.15minute'),
    value: 15 * 60 * 1000,
  },
  {
    label: i18n.t('ws:filter.time_period_value.30minute'),
    value: 30 * 60 * 1000,
  },
  {
    label: i18n.t('ws:filter.time_period_value.1hour'),
    value: 60 * 60 * 1000,
  },
  {
    label: i18n.t('ws:filter.time_period_value.2hour'),
    value: 2 * 60 * 60 * 1000,
  },
  {
    label: i18n.t('ws:filter.time_period_value.5hour'),
    value: 5 * 60 * 60 * 1000,
  },
  {
    label: i18n.t('ws:filter.time_period_value.10hour'),
    value: 10 * 60 * 60 * 1000,
  },
  {
    label: i18n.t('ws:filter.time_period_value.12hour'),
    value: 12 * 60 * 60 * 1000,
  },
  {
    label: i18n.t('ws:filter.time_period_value.1day'),
    value: 24 * 60 * 60 * 1000,
  },
  {
    label: i18n.t('ws:filter.time_period_value.7day'),
    value: 7 * 24 * 60 * 60 * 1000,
  },
  {
    label: i18n.t('ws:filter.time_period_value.30day'),
    value: 30 * 24 * 60 * 60 * 1000,
  },
] as const

export const WS_REALTIME_INTERVAL = [
  {
    label: i18n.t('ws:filter.interval.1second'),
    value: 1000,
  }, //0
  {
    label: i18n.t('ws:filter.interval.5second'),
    value: 5 * 1000,
  }, //1
  {
    label: i18n.t('ws:filter.interval.10second'),
    value: 10 * 1000,
  }, //2
  {
    label: i18n.t('ws:filter.interval.15second'),
    value: 15 * 1000,
  }, //3
  {
    label: i18n.t('ws:filter.interval.30second'),
    value: 30 * 1000,
  }, //4
  {
    label: i18n.t('ws:filter.interval.1minute'),
    value: 60 * 1000,
  }, //5
  {
    label: i18n.t('ws:filter.interval.2minute'),
    value: 2 * 60 * 1000,
  }, //6
  {
    label: i18n.t('ws:filter.interval.5minute'),
    value: 5 * 60 * 1000,
  }, //7
  {
    label: i18n.t('ws:filter.interval.10minute'),
    value: 10 * 60 * 1000,
  }, //8
  {
    label: i18n.t('ws:filter.interval.15minute'),
    value: 15 * 60 * 1000,
  }, //9
  {
    label: i18n.t('ws:filter.interval.30minute'),
    value: 30 * 60 * 1000,
  }, //10
  {
    label: i18n.t('ws:filter.interval.1hour'),
    value: 60 * 60 * 1000,
  }, //11
  {
    label: i18n.t('ws:filter.interval.2hour'),
    value: 2 * 60 * 60 * 1000,
  }, //12
  {
    label: i18n.t('ws:filter.interval.10hour'),
    value: 10 * 60 * 60 * 1000,
  }, //14
  {
    label: i18n.t('ws:filter.interval.12hour'),
    value: 12 * 60 * 60 * 1000,
  }, //15
  {
    label: i18n.t('ws:filter.interval.1day'),
    value: 24 * 60 * 60 * 1000,
  }, //16
] as const

export const WS_REALTIME_REF = [
  // 1 second
  { start: 0, end: 0 },
  // 5 seconds
  { start: 0, end: 0 },
  // 10 seconds
  { start: 0, end: 0 },
  // 15 seconds
  { start: 0, end: 0 },
  // 30 seconds
  { start: 0, end: 0 },
  // 1 minute
  { start: 0, end: 1 },
  // 2 minutes
  { start: 0, end: 3 },
  // 5 minutes
  { start: 0, end: 3 },
  // 10 minutes
  { start: 1, end: 5 },
  // 15 minutes
  { start: 1, end: 6 },
  // 30 minutes
  { start: 1, end: 6 },
  // 1 hour
  { start: 2, end: 7 },
  // 2 hours
  { start: 3, end: 8 },
  // 5 hours
  { start: 5, end: 10 },
  // 10 hours
  { start: 6, end: 11 },
  // 12 hours
  { start: 6, end: 11 },
  // 1 day
  { start: 7, end: 12 },
  // 7 days
  { start: 10, end: 16 },
  // 30 days
  { start: 11, end: 16 },
] as const

export const wsInterval = [
  { label: 'Second', value: 1000 },
  { label: 'Minute', value: 60 * 1000 },
  { label: 'Hour', value: 60 * 60 * 1000 },
  { label: 'Day', value: 24 * 60 * 60 * 1000 },
  { label: 'Week', value: 7 * 24 * 60 * 60 * 1000 },
  { label: 'Month', value: 30 * 24 * 60 * 60 * 1000 },
  { label: 'Year', value: 365 * 24 * 60 * 60 * 1000 },
] as const

export const widgetAgg = [
  { label: 'None', value: 'NONE' },
  { label: 'Average', value: 'AVG' },
  { label: 'Min', value: 'MIN' },
  { label: 'Max', value: 'MAX' },
  { label: 'Sum', value: 'SUM' },
  { label: 'Count', value: 'COUNT' },
] as const

export const attrWidgetSchema = z.array(
  z.object({
    attribute_key: z
      .string()
      .min(1, { message: i18n.t('ws:filter.choose_attr') }),
    label: z.string(),
    color: z.string(),
    unit: z.string(),
    max: z.number(),
    min: z.number().optional(),
    deviceName: z.string().optional(),
  }),
)

export const widgetDataTypeSchema = z.enum(['REALTIME', 'HISTORY'] as const, {
  errorMap: () => ({ message: i18n.t('ws:filter.choose_widgetType') }),
})

export const widgetTypeSchema = z
  .enum(['TIMESERIES', 'LASTEST'] as const)
  .optional()

export type WidgetCategoryType = z.infer<typeof widgetCategorySchema>

export const widgetSchema = z.object({
  title: z.string(),
  description: widgetCategorySchema,
  type: widgetTypeSchema,
  datasource: z.object({
    init_message: z.string(),
    lastest_message: z.string(),
    realtime_message: z.string(),
    history_message: z.string(),
    org_id: z.string(),
    controller_message: z.string().optional(),
  }),
  attribute_config: attrWidgetSchema,
  config: z
    .object({
      chartsetting: z.object({
        start_date: z.number(),
        end_date: z.number(),
        data_type: widgetDataTypeSchema,
        data_point: z.number(),
        time_period: z.number(),
      }),
      timewindow: z.object({
        interval: z.number(),
      }),
      aggregation: aggSchema,
    })
    .nullable(),
})

export const widgetListSchema = z.record(widgetSchema)
export type Widget = z.infer<typeof widgetListSchema>

export const widgetCreateSchema = z.object({
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
          interval: z.number({
            required_error: i18n.t('ws:filter.choose_group_interval'),
          }),
        }),
      ]),
    )
    .and(
      z.discriminatedUnion('dataType', [
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
      ]),
    )
    .optional(),
  id: z.string().optional(),
})

export type WidgetCreate = z.infer<typeof widgetCreateSchema> & { id: string }

type CreateWidgetProps = {
  widgetType: WidgetType
  widgetCategory: WidgetCategoryType
  isMultipleAttr: boolean
  isMultipleDevice: boolean
  isOpen: boolean
  close: () => void
  setWidgetList: React.Dispatch<React.SetStateAction<Widget>>
}

export const widgetDataTypeOptions = [
  { label: 'Realtime', value: 'REALTIME' },
  { label: 'History', value: 'HISTORY' },
]

export function CreateWidget({
  widgetType,
  widgetCategory,
  isMultipleAttr,
  isMultipleDevice,
  isOpen,
  close,
  setWidgetList,
}: CreateWidgetProps) {
  const { t } = useTranslation()

  const { orgId } = useParams()
  const projectId = storage.getProject()?.id

  const cancelButtonRef = useRef(null)
  const colorPickerRef = useRef()

  const {
    register,
    formState,
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    resetField,
  } = useForm<WidgetCreate>({
    resolver: widgetCreateSchema && zodResolver(widgetCreateSchema),
  })
  // console.log('zod errors', formState.errors)

  const { fields, append, remove } = useFieldArray({
    name: 'attributeConfig',
    control: control,
  })

  const { data: orgData, isLoading: orgIsLoading } = useGetOrgs({
    projectId,
    config: {
      suspense: false,
    },
    level: 1,
  })

  const { data: deviceData, isLoading: deviceIsLoading } = useGetDevices({
    orgId: watch('org_id') || orgId,
    projectId,
    config: {
      suspense: false,
    },
  })
  const deviceSelectData = deviceData?.devices.map(device => ({
    value: device.id,
    label: device.name,
  }))

  const getDeviceInfo = (id: string) => {
    let device = null
    for (const d of deviceData?.devices || []) {
      if (d.id === id) {
        device = d
        break
      }
    }
    return device?.name + ' - ' + device?.id
  }

  const {
    data: attrChartData,
    mutate: attrChartMutate,
    isLoading: attrChartIsLoading,
  } = useCreateAttrChart()
  const attrSelectData = attrChartData?.entities?.flatMap(item => {
    const result = item.attr_keys.map(attr => ({
      label: attr,
      value: attr,
    }))
    return result
  })

  // remove duplicate in attrSelectData
  function removeDup(
    array: Array<{ label: string; value: string }> | undefined,
  ) {
    if (!array) return
    // remove duplicate element
    const result = array.filter((item, index) => {
      return (
        array.findIndex(
          item2 => item2.label === item.label && item2.value === item.value,
        ) === index
      )
    })
    return result
  }

  const attrSelectDataForMap = [
    { value: 'latitude', label: 'latitude' },
    { value: 'longitude', label: 'longitude' },
  ]

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

  const setDeviceOptionForMap = (attribute: string) => {
    const result: Array<{
      value: string
      label: string
    }> = []
    attrChartData?.entities?.map(item => {
      item?.attr_keys?.map(attr => {
        if (attr === attribute) {
          // filter all item in deviceData that have id = item.entity_id
          const devices = deviceData?.devices.filter(
            device =>
              device.id === item.entity_id &&
              device.attributes.filter(
                attr =>
                  attr.attribute_key === attribute && attr.value_type === 'DBL',
              ),
          )
          devices?.map(device => {
            const deviceInfo = getDeviceInfo(device.id)
            if (deviceInfo.includes('undefined')) return
            result.push({
              value: device.id,
              label: deviceInfo,
            })
          })
        }
      })
    })
    return result
  }

  useEffect(() => {
    append({
      attribute_key: '',
      label: '',
      color: '',
      unit: '',
      max: 100,
      min: 0,
    })
  }, [])

  const selectDropdownDeviceRef = useRef<SelectInstance<SelectOption[]> | null>(
    null,
  )

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

  function handleModifyOrg() {
    selectDropdownDeviceRef.current?.clearValue()
    resetField('attributeConfig', {
      defaultValue: [
        {
          attribute_key: '',
          label: '',
          color: '',
          max: 100,
          min: 0,
          unit: '',
        },
      ],
    })
  }

  useEffect(() => {
    const defaultOption =
      intervalOptionHandler(watch('widgetSetting.time_period')) || []
    if (defaultOption.length > 0) {
      setValue('widgetSetting.interval', defaultOption[0].value)
    }
  }, [watch('widgetSetting.time_period')])

  return (
    <Dialog isOpen={isOpen} onClose={close} initialFocus={cancelButtonRef}>
      <div className="inline-block rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:p-6 sm:align-middle md:w-[75rem]">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <div className="mb-5 flex items-center justify-between">
            <DialogTitle className="text-h1 text-secondary-900">
              {widgetCategory === 'LINE'
                ? t('cloud:dashboard.config_chart.title_line')
                : widgetCategory === 'BAR'
                ? t('cloud:dashboard.config_chart.title_bar')
                : widgetCategory === 'TABLE'
                ? t('cloud:dashboard.config_chart.title_table')
                : widgetCategory === 'PIE'
                ? t('cloud:dashboard.config_chart.title_pie')
                : widgetCategory === 'GAUGE'
                ? t('cloud:dashboard.config_chart.title_gauge')
                : widgetCategory === 'CARD'
                ? t('cloud:dashboard.config_chart.title_card')
                : widgetCategory === 'MAP'
                ? t('cloud:dashboard.config_chart.title_map')
                : null}
            </DialogTitle>
            <div className="ml-3 flex h-7 items-center">
              <button
                className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                onClick={close}
              >
                <span className="sr-only">Close panel</span>
                <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>

          <form
            id="create-widget"
            className="flex w-full flex-col justify-between space-y-5"
            onSubmit={handleSubmit(values => {
              const widgetId = uuidv4()
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
                description: widgetCategory,
                type: widgetType,
                datasource: {
                  init_message: JSON.stringify(initMessage),
                  lastest_message:
                    widgetType === 'LASTEST'
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
                  label: item.label,
                  min: item.min,
                  unit: item.unit,
                })),
                config:
                  widgetType === 'TIMESERIES'
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
                              ? Date.now() - values.widgetSetting?.time_period
                              : undefined,
                        },
                      }
                    : null,
              }

              setWidgetList(prev => ({ ...prev, ...{ [widgetId]: widget } }))

              close()
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
                    <ComplexTree
                      name="org_id"
                      label={t(
                        'cloud:org_manage.device_manage.add_device.parent',
                      )}
                      error={formState.errors['org_id']}
                      control={control}
                      options={orgData?.organizations}
                      customOnChange={() => {
                        selectDropdownDeviceRef.current?.clearValue()
                        resetField('attributeConfig', {
                          defaultValue: [
                            {
                              attribute_key: '',
                              label: '',
                              color: '',
                              max: 100,
                              min: 0,
                              unit: '',
                            },
                          ],
                        })
                      }}
                    />

                    <SelectDropdown
                      refSelect={selectDropdownDeviceRef}
                      label={t('cloud:dashboard.config_chart.device')}
                      error={formState?.errors?.device?.[0]}
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
                      isMulti={isMultipleDevice}
                      closeMenuOnSelect={!isMultipleDevice}
                      isWrappedArray
                      customOnChange={option => {
                        if (option != null) {
                          attrChartMutate({
                            data: {
                              entity_ids: option,
                              entity_type: 'DEVICE',
                              version_two: true,
                              // time_series: true,
                            },
                          })
                          // removeField(option)
                        }
                      }}
                      handleClearSelectDropdown={() => {
                        resetField('attributeConfig', {
                          defaultValue: [
                            {
                              attribute_key: '',
                              label: '',
                              color: '',
                              max: 100,
                              min: 0,
                              unit: '',
                            },
                          ],
                        })
                      }}
                    />
                  </div>
                  <div className="flex justify-between space-x-3">
                    <TitleBar
                      title={t(
                        'cloud:dashboard.detail_dashboard.add_widget.data_chart',
                      )}
                      className="w-full rounded-md bg-secondary-700 pl-3"
                    />
                    {isMultipleAttr ? (
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
                        {widgetCategory === 'MAP' ? (
                          <SelectDropdown
                            label={t('cloud:dashboard.config_chart.attr')}
                            error={
                              formState?.errors?.attributeConfig?.[index]
                                ?.attribute_key
                            }
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
                          />
                        ) : (
                          <SelectDropdown
                            label={t('cloud:dashboard.config_chart.attr')}
                            error={
                              formState?.errors?.attributeConfig?.[index]
                                ?.attribute_key
                            }
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
                          />
                        )}
                        {!watch(`attributeConfig.${index}.attribute_key`) ||
                        widgetCategory === 'GAUGE' ||
                        widgetCategory === 'CARD' ? null : widgetCategory ===
                          'MAP' ? (
                          <SelectDropdown
                            name={`attributeConfig.${index}.label`}
                            label={t('cloud:dashboard.config_chart.label')}
                            error={
                              formState?.errors?.attributeConfig?.[index]?.label
                            }
                            control={control}
                            options={setDeviceOptionForMap(
                              watch(`attributeConfig.${index}.attribute_key`),
                            )}
                            isLoading={attrChartIsLoading}
                          />
                        ) : (
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
                            // defaultValue={attrLabelData[0]}
                          />
                        )}
                        {!['GAUGE', 'TABLE', 'MAP', 'CONTROLLER', 'CARD'].find(
                          e => widgetCategory === e,
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
                                            className="w-10"
                                            style={{
                                              backgroundColor: `${value}`,
                                            }}
                                          />
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
                        {widgetCategory === 'GAUGE' && (
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
                      {isMultipleAttr ? (
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

                  {widgetType === 'TIMESERIES' ? (
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

                        {watch('widgetSetting.agg') == 'NONE' ? (
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
                            error={
                              // @ts-expect-error: https://stackoverflow.com/questions/74219465/typescript-react-hook-form-error-handling-with-zod-union-schema
                              formState?.errors?.widgetSetting?.time_period
                            }
                            registration={register(
                              `widgetSetting.time_period` as const,
                              {
                                valueAsNumber: true,
                              },
                            )}
                            options={WS_REALTIME_PERIOD.map(period => ({
                              label: period.label,
                              value: period.value,
                            }))}
                          />
                        )}

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
                                            <LuCalendar className="mr-2 h-4 w-4" />
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
                                    : formState?.errors?.widgetSetting
                                        ?.startDate
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
                                            <LuCalendar className="mr-2 h-4 w-4" />
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
        </div>

        <div className="mt-4 flex justify-center space-x-2">
          <div className="mt-4 flex justify-center space-x-2">
            <Button
              type="button"
              size="md"
              variant="secondary"
              onClick={close}
              startIcon={
                <img src={btnCancelIcon} alt="Cancel" className="h-5 w-5" />
              }
              ref={cancelButtonRef}
            />
            <Button
              form="create-widget"
              type="submit"
              variant="primary"
              size="md"
              startIcon={
                <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
              }
              // disabled={!formState.isValid}
            />
          </div>
        </div>
      </div>
    </Dialog>
  )
}

/* <div className="space-y-1">
  <FieldWrapper
    label={t('cloud:dashboard.config_chart.attr')}
    error={
      formState?.errors?.attributeConfig?.[index]
        ?.attribute_key
    }
  >
    <Controller
      control={control}
      name={`attributeConfig.${index}.attribute_key`}
      render={({
        field: { onChange, value, ...field },
      }) => {
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="trans"
                size="md"
                role="combobox"
                className={cn(
                  'h-9 w-[200px] justify-between rounded-md !px-3 !text-body-sm',
                  !value && 'text-secondary-700',
                )}
              >
                {value !== ''
                  ? attrSelectData.find(
                      attr => attr.value === value,
                    )?.label
                  : t('placeholder:select')}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Command>
                <CommandInput />
                <CommandEmpty>
                  {t('table:no_attr')}
                </CommandEmpty>
                <CommandGroup>
                  {attrSelectData.map(attr => (
                    <CommandItem
                      value={attr.label}
                      key={attr.value}
                      onSelect={() => {
                        setValue(
                          `attributeConfig.${index}.attribute_key`,
                          attr.value,
                        )
                      }}
                    >
                      {attr.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        )
      }}
    />
  </FieldWrapper>
</div> */
