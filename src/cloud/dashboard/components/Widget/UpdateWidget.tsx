import { useTranslation } from 'react-i18next'
import { type z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useEffect, useMemo, useRef, useState } from 'react'
import ColorPicker from 'react-pick-color'

import { FormDialog } from '~/components/FormDialog'
import { Button } from '~/components/Button'
import {
  type Widget,
  type WidgetCreate,
  widgetCreateSchema,
  type widgetSchema,
  widgetDataTypeOptions,
  wsInterval,
  widgetAgg,
} from './CreateWidget'
import { Spinner } from '~/components/Spinner'
import TitleBar from '~/components/Head/TitleBar'
import {
  FieldWrapper,
  InputField,
  SelectDropdown,
  SelectField,
  type SelectOption,
} from '~/components/Form'
import { useGetOrgs } from '~/layout/MainLayout/api'
import { cn, flattenData } from '~/utils/misc'
import { useDefaultCombobox } from '~/utils/hooks'
import { useGetDevices } from '~/cloud/orgManagement/api/deviceAPI'
import storage from '~/utils/storage'
import { useCreateAttrChart } from '../../api'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/Popover'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { EditBtnIcon, PlusIcon } from '~/components/SVGIcons'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar, TimePicker } from '~/components/Calendar'
import { useParams } from 'react-router-dom'
import { type SelectInstance } from 'react-select'
import i18n from '~/i18n'

const WS_REALTIME_PERIOD = [
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
]

const WS_REALTIME_INTERVAL = [
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
]

const WS_REALTIME_REF = [
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
]

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
  // console.log('widgetInfoMemo', widgetInfoMemo)

  const initParse =
    widgetInfoMemo?.datasource?.init_message &&
    JSON.parse(widgetInfoMemo?.datasource?.init_message)

  const selectDropdownDeviceRef = useRef<SelectInstance<SelectOption[]> | null>(
    null,
  )
  const selectDropdownAttributeConfigRef = useRef<SelectInstance<
    SelectOption[]
  > | null>(null)

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
        interval: widgetInfoMemo?.config?.timewindow?.interval,
        data_point: widgetInfoMemo?.config?.chartsetting?.data_point,
        startDate: widgetInfoMemo?.config?.chartsetting?.start_date,
        endDate: widgetInfoMemo?.config?.chartsetting?.end_date,
      },
    },
  })
  // console.log('formState.errors', formState.errors)

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
  const orgSelectOptions = [defaultComboboxOrgData, ...orgFlattenData].map(
    org => ({
      label: org?.name,
      value: org?.id,
    }),
  )

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
    attrChartMutate({
      data: {
        entity_ids: watch('device') || [],
        entity_type: 'DEVICE',
      },
    })
  }, [])

  // useEffect(() => {
  //   if (initParse?.entityDataCmds[0]?.query?.entityFilter?.entityIds) {
  //     attrChartMutate({
  //       data: {
  //         entity_ids:
  //           initParse?.entityDataCmds[0]?.query?.entityFilter?.entityIds,
  //         entity_type: 'DEVICE',
  //       },
  //     })
  //   }
  //   setIsDone(false)
  // }, [widgetInfoMemo])

  function intervalOptionHandler() {
    const timePeriod = watch('widgetSetting.time_period')
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

  console.log(isDone)

  return (
    <FormDialog
      size="max"
      title={t('cloud:dashboard.config_chart.update')}
      isDone={isDone}
      body={
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
                min: item.min,
                // label: item.label,
                unit: item.unit,
              })),
              config:
                widgetInfoMemo?.type === 'TIMESERIES'
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
                  className="bg-secondary-700 w-full rounded-md pl-3"
                />
                <div className="grid grid-cols-1 gap-x-4 px-2 md:grid-cols-3">
                  <InputField
                    label={t('cloud:dashboard.config_chart.name')}
                    error={formState.errors['title']}
                    registration={register('title')}
                  />

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
                    handleClearSelectDropdown={() => {
                      selectDropdownDeviceRef.current?.clearValue()
                      selectDropdownAttributeConfigRef.current?.clearValue()
                    }}
                    handleChangeSelect={() => {
                      selectDropdownDeviceRef.current?.clearValue()
                      selectDropdownAttributeConfigRef.current?.clearValue()
                    }}
                    defaultValue={
                      widgetInfoMemo?.datasource?.org_id
                        ? orgSelectOptions?.find(
                            item =>
                              item.value ===
                              JSON.parse(widgetInfoMemo?.datasource?.org_id),
                          )
                        : [
                            {
                              label: '',
                              value: '',
                            },
                          ]
                    }
                    error={formState?.errors?.org_id}
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
                            },
                          })
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
                    className="bg-secondary-700 w-full rounded-md pl-3"
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
                        <PlusIcon width={16} height={16} viewBox="0 0 16 16" />
                      }
                      onClick={() =>
                        append({
                          attribute_key: '',
                          // label: '',
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
                        <SelectDropdown
                          // refSelect={selectDropdownAttributeConfigRef}
                          label={t('cloud:dashboard.config_chart.attr')}
                          name={`attributeConfig.${index}.attribute_key`}
                          control={control}
                          options={attrSelectData}
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
                          defaultValue={attrSelectData?.find(
                            item =>
                              widgetInfoMemo?.attribute_config[index]
                                ?.attribute_key === item.value,
                          )}
                          error={
                            formState?.errors?.attributeConfig?.[index]
                              ?.attribute_key
                          }
                        />
                      </div>
                      {!['GAUGE', 'TABLE', 'MAP', 'CONTROLLER', 'CARD'].find(
                        e => widgetInfoMemo?.description === e,
                      ) ? (
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
                      className="bg-secondary-700 w-full rounded-md pl-3"
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
                          error={formState?.errors?.widgetSetting?.interval}
                          registration={register(
                            `widgetSetting.interval` as const,
                            {
                              valueAsNumber: true,
                            },
                          )}
                          options={WS_REALTIME_INTERVAL.map(interval => ({
                            label: interval.label,
                            value: interval.value,
                          }))}
                        />
                      ) : (
                        <SelectField
                          label={t('ws:filter.time_period')}
                          error={formState?.errors?.widgetSetting?.time_period}
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
                                            'focus:outline-focus-400 focus:ring-focus-400 relative w-full !justify-start rounded-md text-left font-normal focus:outline-2 focus:outline-offset-0',
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
                              label={t('cloud:dashboard.config_chart.endDate')}
                              error={
                                getValues('widgetSetting.dataType') ===
                                'REALTIME'
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
                          error={formState?.errors?.widgetSetting?.interval}
                          registration={register(
                            `widgetSetting.interval` as const,
                            {
                              valueAsNumber: true,
                            },
                          )}
                          options={intervalOptionHandler()}
                        />
                      )}
                    </div>
                  </>
                ) : null}
              </>
            )}
          </>
        </form>
      }
      triggerButton={
        <Button
          className="hover:text-primary-400 h-5 w-5"
          variant="none"
          size="square"
          startIcon={<EditBtnIcon width={20} height={17} viewBox="0 0 20 17" />}
        />
      }
      confirmButton={
        <Button
          form="update-widget"
          type="submit"
          size="md"
          className="bg-primary-400 rounded-md border"
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    />
  )
}
