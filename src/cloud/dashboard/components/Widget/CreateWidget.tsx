import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
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
  type SelectOptionGeneric,
  type SelectOptionString,
} from '~/components/Form'
import { useGetDevices } from '~/cloud/orgManagement/api/deviceAPI'
import { Dialog, DialogTitle } from '~/components/Dialog'
import { cn, flattenData } from '~/utils/misc'
import storage from '~/utils/storage'
import { useCreateAttrChart } from '../../api'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/Popover'
import { Calendar } from '~/components/Calendar'
import { useGetOrgs } from '~/layout/MainLayout/api'
import TitleBar from '~/components/Head/TitleBar'
import { Spinner } from '~/components/Spinner'
import { widgetAgg, wsInterval } from '../../routes/DashboardDetail'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '~/components/Command'
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

export const attrWidgetSchema = z.array(
  z.object({
    attribute_key: z.string(),
    label: z.string(),
    color: z.string(),
    unit: z.string(),
    decimal: z.string(),
  }),
)

export const widgetDataTypeSchema = z.enum(['REALTIME', 'HISTORY'] as const)
type WidgetDataType = z.infer<typeof widgetDataTypeSchema>

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
      }),
      timewindow: z.object({
        interval: z.number(),
      }),
      aggregation: aggSchema,
    })
    .nullable(),
})
// .and(
//   z.discriminatedUnion('type', [
//     z.object({
//       type: z.literal('TIMESERIES'),
//       config: z.object({
//         chartsetting: z.object({
//           start_date: z.number(),
//           end_date: z.number(),
//           data_type: widgetDataTypeSchema,
//         }),
//         timewindow: z.object({
//           interval: z.number(),
//         }),
//         aggregation: aggSchema,
//       }),
//     }),
//     z.object({
//       type: z.literal('LASTEST'),
//     }),
//   ]),
// )

export const widgetListSchema = z.record(widgetSchema)
export type Widget = z.infer<typeof widgetListSchema>

export const widgetCreateSchema = z.object({
  title: nameSchema,
  type: widgetTypeSchema,
  org_id: z.string(),
  device: z.array(
    z.string().min(1, {
      message: i18n.t(
        'cloud:org_manage.device_manage.add_device.choose_device',
      ),
    }),
  ),
  attributeConfig: attrWidgetSchema,
  widgetSetting: z
    .object({
      agg: aggSchema,
      interval: z.coerce.number(),
      startDate: z.date({
        required_error: i18n.t('cloud:dashboard.config_chart.pick_date_alert'),
      }),
      endDate: z
        .date({
          required_error: i18n.t(
            'cloud:dashboard.config_chart.pick_date_alert',
          ),
        })
        .optional(),
      dataType: widgetDataTypeSchema,
      window: z.coerce.number().optional(),
    })
    .optional(),
  id: z.string().optional(),
})
// .and(
//   z.discriminatedUnion('type', [
//     z.object({
//       type: z.literal('TIMESERIES'),
//       widgetSetting: z.object({
//         agg: aggSchema,
//         interval: z.coerce.number(),
//         startDate: z.date({
//           required_error: i18n.t(
//             'cloud:dashboard.config_chart.pick_date_alert',
//           ),
//         }),
//         endDate: z
//           .date({
//             required_error: i18n.t(
//               'cloud:dashboard.config_chart.pick_date_alert',
//             ),
//           })
//           .optional(),
//         dataType: widgetDataTypeSchema,
//       }),
//     }),
//     z.object({
//       type: z.literal('LASTEST'),
//     }),
//   ]),
// )

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

const widgetDataTypeOptions: SelectOptionGeneric<WidgetDataType>[] = [
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
  const [optionOrg, setOptionOrg] = useState({
    label: t('search:no_org'),
    value: '',
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

  const [deviceValue, setDeviceValue] = useState<SelectOptionString[]>()
  const { data: deviceData } = useGetDevices({
    orgId: optionOrg?.value,
    projectId,
    config: {
      suspense: false,
    },
  })
  const deviceSelectData = deviceData?.devices.map(device => ({
    value: device.id,
    label: device.name,
  })) || [{ value: '', label: '' }]

  const { data: attrChartData, mutate: attrChartMutate } = useCreateAttrChart({
    config: {
      enabled: deviceValue?.[0]?.value !== '',
      suspense: false,
    },
  })
  const attrSelectData = attrChartData?.keys?.map(item => ({
    value: item,
    label: item,
  })) || [{ value: '', label: '' }]

  const { register, formState, control, handleSubmit, setValue, watch } =
    useForm<WidgetCreate>({
      resolver: widgetCreateSchema && zodResolver(widgetCreateSchema),
    })
  // console.log('zod errors', formState.errors)

  const { fields, append, remove } = useFieldArray({
    name: 'attributeConfig',
    control: control,
  })
  const [aggValue, setAggValue] = useState('')
  const [widgetDataTypeValue, setWidgetDataTypeValue] =
    useState<WidgetDataType>('REALTIME')

  useEffect(() => {
    append({
      attribute_key: '',
      label: '',
      color: '',
      unit: '',
      decimal: '',
    })
  }, [])

  return (
    <Dialog isOpen={isOpen} onClose={close} initialFocus={cancelButtonRef}>
      <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:p-6 sm:align-middle md:w-[75rem]">
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
              // console.log('values: ', values)
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

              const realtimeMessage = {
                entityDataCmds: [
                  {
                    tsCmd: {
                      keys: values.attributeConfig.map(
                        item => item.attribute_key,
                      ),
                      startTs: Date.parse(
                        values.widgetSetting?.startDate?.toISOString() as string,
                      ),
                      interval: values.widgetSetting?.interval,
                      limit: 10,
                      offset: 0,
                      agg: values.widgetSetting?.agg,
                    },
                    id: widgetId,
                  },
                ],
              }

              const historyMessage =
                values.widgetSetting?.agg === 'SMA'
                  ? {
                      entityDataCmds: [
                        {
                          historyCmd: {
                            keys: values.attributeConfig.map(
                              item => item.attribute_key,
                            ),
                            startTs: Date.parse(
                              values.widgetSetting?.startDate?.toISOString(),
                            ),
                            endTs: Date.parse(
                              values.widgetSetting?.endDate?.toISOString() as string,
                            ),
                            interval: values.widgetSetting?.interval,
                            limit: 100,
                            offset: 0,
                            agg: values.widgetSetting?.agg,
                            window: values.widgetSetting?.window,
                          },
                          id: widgetId,
                        },
                      ],
                    }
                  : {
                      entityDataCmds: [
                        {
                          historyCmd: {
                            keys: values.attributeConfig.map(
                              item => item.attribute_key,
                            ),
                            startTs: Date.parse(
                              values.widgetSetting?.startDate?.toISOString() as string,
                            ),
                            endTs: Date.parse(
                              values.widgetSetting?.endDate?.toISOString() as string,
                            ),
                            interval: values.widgetSetting?.interval,
                            limit: 100,
                            offset: 0,
                            agg: values.widgetSetting?.agg,
                          },
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
                  decimal: item.decimal,
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
                            values.widgetSetting
                              ?.startDate as unknown as number,
                          ).getTime(),
                          end_date: new Date(
                            values.widgetSetting?.endDate as unknown as number,
                          ).getTime(),
                          data_type: values.widgetSetting?.dataType,
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
                      placeholder={t('cloud:dashboard.config_chart.name')}
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
                          orgSelectOptions?.map(org => ({
                            label: org?.name,
                            value: org?.id,
                          })) || [{ label: t('loading:org'), value: '' }]
                        }
                        onChange={e => {
                          setOptionOrg(e)
                          setValue('org_id', e?.value)
                        }}
                        value={optionOrg}
                      />
                      <p className="text-body-sm text-primary-400">
                        {formState?.errors?.org_id?.message === 'Required'
                          ? t('cloud:org_manage.org_manage.add_org.choose_org')
                          : formState?.errors?.org_id?.message}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <SelectDropdown
                        label={t('cloud:dashboard.config_chart.device')}
                        name="device"
                        isClearable
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
                        value={deviceValue}
                        onChange={(e: SelectOptionString[]) => {
                          const entityIdsArr =
                            e.length > 0
                              ? e.map(item => {
                                  return item.value
                                })
                              : [(e as unknown as SelectOptionString).value]
                          setDeviceValue(e)
                          setValue('device', entityIdsArr)
                          attrChartMutate({
                            data: {
                              entity_ids: entityIdsArr,
                              entity_type: 'DEVICE',
                              // time_series: true,
                            },
                          })
                        }}
                      />
                      <p className="text-body-sm text-primary-400">
                        {formState?.errors?.device?.message === 'Required'
                          ? t(
                              'cloud:org_manage.device_manage.add_device.choose_device',
                            )
                          : formState?.errors?.device?.[0]?.message}
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
                            decimal: '',
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
                      <div className="grid grid-cols-1 gap-x-4 px-2 md:grid-cols-5">
                        <div className="space-y-1">
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
                                          : t('placeholder:general')}
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
                        </div>
                        <InputField
                          label={t('cloud:dashboard.config_chart.label')}
                          error={
                            formState?.errors?.attributeConfig?.[index]?.label
                          }
                          registration={register(
                            `attributeConfig.${index}.label` as const,
                          )}
                        />
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
                        <InputField
                          label={t('cloud:dashboard.config_chart.decimal')}
                          error={
                            formState?.errors?.attributeConfig?.[index]?.decimal
                          }
                          registration={register(
                            `attributeConfig.${index}.decimal` as const,
                          )}
                        />
                        {/* {type === 'road' ? (
                                <div className="space-y-1">
                                  <SelectDropdown
                                    label={t('cloud:dashboard.config_chart.road')}
                                    name="typeRoad"
                                    isClearable={false}
                                    control={control}
                                    options={[
                                      { label: 'Đường thẳng', value: 'Đường thẳng' },
                                      { label: 'Đường nét đứt', value: 'Đường nét đứt' },
                                    ]}
                                    value={typeRoadValue}
                                    onChange={e => {
                                      setTypeRoadValue(e)
                                    }}
                                  />
                                  <p className="text-body-sm text-primary-400">
                                    {formState?.errors?.typeRoad?.message}
                                  </p>
                                </div>
                              ) : ('')} */}
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
                          )}
                          options={widgetDataTypeOptions.map(dataType => ({
                            label: dataType.label,
                            value: dataType.value,
                          }))}
                          onChange={e => {
                            setWidgetDataTypeValue(
                              e.target.value as WidgetDataType,
                            )
                          }}
                        />

                        <div className="space-y-1">
                          <FieldWrapper
                            label={t('cloud:dashboard.config_chart.startDate')}
                            error={formState?.errors?.widgetSetting?.startDate}
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
                                          'relative w-full !justify-start rounded-md text-left font-normal',
                                          !value && 'text-secondary-700',
                                        )}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {value ? (
                                          <span>
                                            {format(value, 'dd/MM/y')}
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
                                    </PopoverContent>
                                  </Popover>
                                )
                              }}
                            />
                          </FieldWrapper>
                        </div>

                        <div className="space-y-1">
                          <FieldWrapper
                            label={t('cloud:dashboard.config_chart.endDate')}
                            error={
                              widgetDataTypeValue === 'REALTIME'
                                ? ''
                                : formState?.errors?.widgetSetting?.startDate
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
                                          widgetDataTypeValue === 'REALTIME'
                                        }
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {value ? (
                                          <span>
                                            {format(value, 'dd/MM/y')}
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
                                    </PopoverContent>
                                  </Popover>
                                )
                              }}
                            />
                          </FieldWrapper>
                        </div>

                        <SelectField
                          label={t('ws:filter.interval')}
                          error={formState?.errors?.widgetSetting?.interval}
                          registration={register(
                            `widgetSetting.interval` as const,
                          )}
                          options={wsInterval.map(interval => ({
                            label: interval.label,
                            value: interval.value,
                          }))}
                        />
                        <SelectField
                          label={t('ws:filter.data_aggregation')}
                          error={formState?.errors?.widgetSetting?.agg}
                          registration={register(`widgetSetting.agg` as const)}
                          options={
                            widgetDataTypeValue === 'HISTORY'
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
                          onChange={e => {
                            setAggValue(e.target.value)
                          }}
                        />
                        {aggValue === 'SMA' ? (
                          <InputField
                            label={t('ws:filter.sma_window')}
                            error={formState?.errors?.widgetSetting?.window}
                            registration={register(
                              `widgetSetting.window` as const,
                            )}
                          />
                        ) : (
                          <></>
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
            />
          </div>
        </div>
      </div>
    </Dialog>
  )
}
