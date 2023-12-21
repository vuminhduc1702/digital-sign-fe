import { useTranslation } from 'react-i18next'
import { type z } from 'zod'
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

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { EditBtnIcon, PlusIcon } from '~/components/SVGIcons'
import { useEffect, useRef, useState } from 'react'
import { Spinner } from '~/components/Spinner'
import TitleBar from '~/components/Head/TitleBar'
import {
  FieldWrapper,
  InputField,
  SelectDropdown,
  SelectField,
} from '~/components/Form'
import { useGetOrgs } from '~/layout/MainLayout/api'
import { cn, flattenData } from '~/utils/misc'
import { useDefaultCombobox } from '~/utils/hooks'
import { useGetDevices } from '~/cloud/orgManagement/api/deviceAPI'
import storage from '~/utils/storage'
import { useCreateAttrChart } from '../../api'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/Popover'
import ColorPicker from 'react-pick-color'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar, TimePicker } from '~/components/Calendar'
import { useParams } from 'react-router-dom'

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

  const initParse =
    widgetInfo?.datasource?.init_message &&
    JSON.parse(widgetInfo?.datasource?.init_message)

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
    values: {
      title: widgetInfo?.title,
      org_id: widgetInfo?.datasource?.org_id
        ? JSON.parse(widgetInfo?.datasource?.org_id)
        : '',
      device: initParse?.entityDataCmds[0]?.query?.entityFilter?.entityIds,
      attributeConfig: widgetInfo?.attribute_config,
      widgetSetting: {
        agg: widgetInfo?.config?.aggregation || 'AVG',
        dataType: widgetInfo?.config?.chartsetting?.data_type || 'REALTIME',
        time_period: widgetInfo?.config?.chartsetting?.time_period || 0,
        interval: widgetInfo?.config?.timewindow?.interval,
        data_point: widgetInfo?.config?.chartsetting?.data_point,
        startDate: widgetInfo?.config?.chartsetting?.start_date,
        endDate: widgetInfo?.config?.chartsetting?.end_date,
      },
    },
  })

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
    if (initParse?.entityDataCmds[0]?.query?.entityFilter?.entityIds) {
      attrChartMutate({
        data: {
          entity_ids:
            initParse?.entityDataCmds[0]?.query?.entityFilter?.entityIds,
          entity_type: 'DEVICE',
        },
      })
    }
    setIsDone(false)
  }, [widgetInfo])

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
              description: widgetInfo?.description || 'LINE',
              type: widgetInfo?.type,
              datasource: {
                init_message: JSON.stringify(initMessage),
                lastest_message:
                  widgetInfo?.type === 'LASTEST'
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
                unit: item.unit,
              })),
              config:
                widgetInfo?.type === 'TIMESERIES'
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
            setIsDone(true)
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
                      resetField('device')
                      resetField('attributeConfig', [{}])
                    }}
                    defaultValue={orgSelectOptions?.find(
                      item =>
                        item.value ===
                        JSON.parse(widgetInfo?.datasource?.org_id),
                    )}
                    error={formState?.errors?.org_id}
                  />

                  <div className="space-y-1">
                    <SelectDropdown
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
                          widgetInfo?.description === 'GAUGE' ||
                          widgetInfo?.description === 'CARD'
                        )
                      }
                      closeMenuOnSelect={
                        widgetInfo?.description === 'GAUGE' ||
                        widgetInfo?.description === 'CARD'
                      }
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
                      handleClearSelectDropdown={() => {
                        resetField('attributeConfig', [{}])
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
                    widgetInfo?.description === 'GAUGE' ||
                    widgetInfo?.description === 'CARD'
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
                      <div className="w-full">
                        <SelectDropdown
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
                              widgetInfo?.attribute_config[index]
                                ?.attribute_key === item.value,
                          )}
                          error={
                            formState?.errors?.attributeConfig?.[index]
                              ?.attribute_key
                          }
                        />
                      </div>
                      {!['GAUGE', 'TABLE', 'MAP', 'CONTROLLER', 'CARD'].find(
                        e => widgetInfo?.description === e,
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
                      {widgetInfo?.description === 'GAUGE' && (
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
                    {!(
                      widgetInfo?.description === 'GAUGE' ||
                      widgetInfo?.description === 'CARD'
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

                {widgetInfo?.type === 'TIMESERIES' ? (
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
                          label={t('ws:filter.time_period')}
                          error={formState?.errors?.widgetSetting?.time_period}
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
