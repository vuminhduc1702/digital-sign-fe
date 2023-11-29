import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import ColorPicker from 'react-pick-color'
import * as z from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { Controller, useFieldArray, useForm } from 'react-hook-form'

import i18n from '~/i18n'
import { Button } from '~/components/Button'
import {
  FieldWrapper,
  InputField,
  SelectDropdown,
  SelectField,
} from '~/components/Form'
import { useGetDevices } from '~/cloud/orgManagement/api/deviceAPI'
import { Dialog, DialogTitle } from '~/components/Dialog'
import { cn, flattenData } from '~/utils/misc'
import storage from '~/utils/storage'
import { useCreateAttrChart } from '../../api'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/Popover'
import { Calendar, TimePicker } from '~/components/Calendar'
import { useGetOrgs } from '~/layout/MainLayout/api'
import TitleBar from '~/components/Head/TitleBar'
import { Spinner } from '~/components/Spinner'
import { useDefaultCombobox } from '~/utils/hooks'

import { aggSchema, widgetCategorySchema, type WidgetType } from '../../types'
import { nameSchema } from '~/utils/schemaValidation'
import { type ControllerBtn } from './CreateControllerButton'

import { Calendar as CalendarIcon } from 'lucide-react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { PlusIcon } from '~/components/SVGIcons'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'

const wsInterval = [
  { label: 'Second', value: 1000 },
  { label: 'Minute', value: 60 * 1000 },
  { label: 'Hour', value: 60 * 60 * 1000 },
  { label: 'Day', value: 24 * 60 * 60 * 1000 },
  { label: 'Week', value: 7 * 24 * 60 * 60 * 1000 },
  { label: 'Month', value: 30 * 24 * 60 * 60 * 1000 },
  { label: 'Year', value: 365 * 24 * 60 * 60 * 1000 },
]

const widgetAggSchema = z.object({
  label: z.string(),
  value: aggSchema,
})
type WidgetAgg = z.infer<typeof widgetAggSchema>
const widgetAgg: WidgetAgg[] = [
  { label: 'None', value: 'NONE' },
  { label: 'Average', value: 'AVG' },
  { label: 'Min', value: 'MIN' },
  { label: 'Max', value: 'MAX' },
  { label: 'Sum', value: 'SUM' },
  { label: 'Count', value: 'COUNT' },
]

export const attrWidgetSchema = z.array(
  z.object({
    attribute_key: z
      .string()
      .min(1, { message: i18n.t('ws:filter.choose_attr') }),
    label: z.string(),
    color: z.string(),
    unit: z.string(),
    max: z.number(),
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

type WidgetCreateDTO = {
  data: z.infer<typeof widgetCreateSchema> & { id: string }
}

export type WidgetCreate = WidgetCreateDTO['data']

type CreateWidgetProps = {
  widgetType: WidgetType
  widgetCategory: WidgetCategoryType
  isMultipleAttr: boolean
  isMultipleDevice: boolean
  isOpen: boolean
  close: () => void
  setWidgetList: React.Dispatch<React.SetStateAction<Widget>>
}

const widgetDataTypeOptions = [
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
  const cancelButtonRef = useRef(null)
  const colorPickerRef = useRef()
  const { id: projectId } = storage.getProject()

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
  console.log('zod errors', formState.errors)

  const { fields, append, remove } = useFieldArray({
    name: 'attributeConfig',
    control: control,
  })

  const { data: orgData, isLoading: orgIsLoading } = useGetOrgs({
    projectId,
    config: {
      suspense: false,
    },
  })
  const { acc: orgFlattenData } = flattenData(
    orgData?.organizations,
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )
  const defaultComboboxOrgData = useDefaultCombobox('org')
  const orgSelectOptions = [defaultComboboxOrgData, ...orgFlattenData]

  const { data: deviceData, isLoading: deviceIsLoading } = useGetDevices({
    orgId: watch('org_id'),
    projectId,
    config: {
      suspense: false,
    },
  })
  const deviceSelectData = deviceData?.devices.map(device => ({
    value: device.id,
    label: device.name,
  }))

  const {
    data: attrChartData,
    mutate: attrChartMutate,
    isLoading: attrChartIsLoading,
  } = useCreateAttrChart()
  const attrSelectData = attrChartData?.keys?.map(item => ({
    value: item,
    label: item,
  }))

  useEffect(() => {
    append({
      attribute_key: '',
      label: '',
      color: '',
      unit: '',
      max: 100,
    })
  }, [])

  return (
    <Dialog isOpen={isOpen} onClose={close} initialFocus={cancelButtonRef}>
      <div className="inline-block transform rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:p-6 sm:align-middle md:w-[75rem]">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <div className="mb-5 flex items-center justify-between">
            <DialogTitle as="h3" className="text-h1 text-secondary-900">
              {t('cloud:dashboard.config_chart.title')}
            </DialogTitle>
            <div className="ml-3 flex h-7 items-center">
              <button
                className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                onClick={close}
              >
                <span className="sr-only">Close panel</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>

          <form
            id="create-widget"
            className="flex w-full flex-col justify-between space-y-5"
            onSubmit={handleSubmit(values => {
              console.log('values: ', values)
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
                interval: values.widgetSetting?.interval,
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
                              Date.now() - values.widgetSetting?.time_period,
                          },
                          id: widgetId,
                        },
                      ],
                    }

              const historyCmd = {
                keys: values.attributeConfig.map(item => item.attribute_key),
                startTs: Date.parse(
                  values.widgetSetting?.startDate?.toISOString(),
                ),
                endTs: Date.parse(
                  values.widgetSetting?.endDate?.toISOString() as string,
                ),
                interval: values.widgetSetting?.interval,
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
                },
                attribute_config: values.attributeConfig.map(item => ({
                  attribute_key: item.attribute_key,
                  color: item.color,
                  max: item.max,
                  label: item.label,
                  unit: item.unit,
                })),
                config:
                  widgetType === 'TIMESERIES'
                    ? {
                        aggregation: values.widgetSetting?.agg,
                        timewindow: {
                          interval: values.widgetSetting?.interval,
                        },
                        chartsetting: {
                          start_date: new Date(
                            values.widgetSetting?.startDate,
                          ).getTime(),
                          end_date: new Date(
                            values.widgetSetting?.endDate,
                          ).getTime(),
                          data_type: values.widgetSetting?.dataType,
                          data_point: values.widgetSetting?.data_point,
                          time_period: values.widgetSetting?.time_period,
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
                        isLoading={orgIsLoading}
                        handleClearSelectDropdown={() => {
                          resetField('device')
                          resetField('attributeConfig.0.attribute_key', {
                            defaultValue: '',
                          })
                        }}
                      />
                      <p className="text-body-sm text-primary-400">
                        {formState?.errors?.org_id?.message}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <SelectDropdown
                        label={t('cloud:dashboard.config_chart.device')}
                        name="device"
                        control={control}
                        options={
                          deviceData != null
                            ? deviceSelectData
                            : deviceData == null
                            ? [
                                {
                                  label: t('table:no_device'),
                                  value: '',
                                },
                              ]
                            : [
                                {
                                  label: t('loading:device'),
                                  value: '',
                                },
                              ]
                        }
                        isOptionDisabled={option =>
                          option.label === t('loading:device') ||
                          option.label === t('table:no_device')
                        }
                        isMulti={isMultipleDevice}
                        closeMenuOnSelect={!isMultipleDevice}
                        isWrappedArray
                        customOnChange={option => {
                          if (option != null) {
                            attrChartMutate({
                              data: {
                                entity_ids: option,
                                entity_type: 'DEVICE',
                                // time_series: true,
                              },
                            })
                          }
                        }}
                        isLoading={deviceIsLoading}
                        handleClearSelectDropdown={() => {
                          resetField('attributeConfig.0.attribute_key', {
                            defaultValue: '',
                          })
                        }}
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
                        <div className="w-full space-y-1">
                          <SelectDropdown
                            label={t('cloud:dashboard.config_chart.attr')}
                            name={`attributeConfig.${index}.attribute_key`}
                            control={control}
                            options={
                              attrChartData != null
                                ? attrSelectData
                                : attrChartData == null
                                ? [
                                    {
                                      label: t('table:no_attr'),
                                      value: '',
                                    },
                                  ]
                                : [
                                    {
                                      label: t('loading:attr'),
                                      value: '',
                                    },
                                  ]
                            }
                            isOptionDisabled={option =>
                              option.label === t('loading:input') ||
                              option.label === t('table:no_attr')
                            }
                            noOptionsMessage={() => t('table:no_attr')}
                            placeholder={t(
                              'cloud:org_manage.org_manage.add_attr.choose_attr',
                            )}
                            isLoading={attrChartIsLoading}
                          />
                          <p className="text-body-sm text-primary-400">
                            {
                              formState?.errors?.attributeConfig?.[index]
                                ?.attribute_key?.message
                            }
                          </p>
                        </div>
                        {/* <InputField
                          label={t('cloud:dashboard.config_chart.label')}
                          error={
                            formState?.errors?.attributeConfig?.[index]?.label
                          }
                          registration={register(
                            `attributeConfig.${index}.label` as const,
                          )}
                        /> */}
                        <div className="space-y-1">
                          <FieldWrapper
                            label={t('cloud:dashboard.config_chart.color')}
                            error={
                              formState?.errors?.attributeConfig?.[index]?.color
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

                        {watch('widgetSetting.agg') === 'NONE' ? (
                          <InputField
                            type="number"
                            label={t('ws:filter.data_point')}
                            error={formState?.errors?.widgetSetting?.data_point}
                            registration={register(
                              `widgetSetting.data_point` as const,
                              {
                                valueAsNumber: true,
                              },
                            )}
                          />
                        ) : (
                          <SelectField
                            label={t('ws:filter.group_interval')}
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
                        )}
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

                        {watch('widgetSetting.dataType') === 'HISTORY' ? (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <FieldWrapper
                                label={t(
                                  'cloud:dashboard.config_chart.startDate',
                                )}
                                error={
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
                            label={t('ws:filter.time_period')}
                            error={
                              formState?.errors?.widgetSetting?.time_period
                            }
                            registration={register(
                              `widgetSetting.time_period` as const,
                              {
                                valueAsNumber: true,
                              },
                            )}
                            options={wsInterval.map(interval => ({
                              label: interval.label,
                              value: interval.value,
                            }))}
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
