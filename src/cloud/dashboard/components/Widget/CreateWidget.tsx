import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import ColorPicker from 'react-pick-color'
import * as z from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { Tab } from '@headlessui/react'
import clsx from 'clsx'
import { Controller } from 'react-hook-form'
import i18n from '~/i18n'

import { Button } from '~/components/Button'
import {
  FieldWrapper,
  FormMultipleFields,
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

import { aggSchema, type WidgetType } from '../../types'
import { nameSchema } from '~/utils/schemaValidation'

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

export const widgetCategorySchema = z.enum([
  'LINE',
  'BAR',
  'PIE',
  'GAUGE',
  'RTDATA',
  'MAP',
  'TABLE',
] as const)
export type WidgetCategoryType = z.infer<typeof widgetCategorySchema>

export const widgetSchema = z.object({
  title: nameSchema,
  type: widgetCategorySchema,
  org_id: z.string(),
  device: z.array(
    z.string().min(1, {
      message: i18n.t(
        'cloud:org_manage.device_manage.add_device.choose_device',
      ),
    }),
  ),
  attributeConfig: attrWidgetSchema,
  widgetSetting: z.object({
    agg: aggSchema,
    interval: z.coerce.number(),
    startDate: z.date({
      required_error: i18n.t('cloud:dashboard.config_chart.pick_date_alert'),
    }),
    endDate: z.date({
      required_error: i18n.t('cloud:dashboard.config_chart.pick_date_alert'),
    }),
    dataType: widgetDataTypeSchema,
    widgetType: widgetTypeSchema,
  }),
  id: z.string().optional(),
})

type WidgetConfigDTO = {
  data: z.infer<typeof widgetSchema>
}

export type WidgetConfig = WidgetConfigDTO['data']

type CreateWidgetProps = {
  widgetType: WidgetType
  widgetCategory: WidgetCategoryType
  isMultipleAttr: boolean
  isOpen: boolean
  close: () => void
  handleSubmitWidget: (value: WidgetConfig) => void
}

const widgetDataType: SelectOptionGeneric<WidgetDataType>[] = [
  { label: 'Realtime', value: 'REALTIME' },
  { label: 'History', value: 'HISTORY' },
]

export function CreateWidget({
  widgetType,
  widgetCategory,
  isMultipleAttr,
  isOpen,
  close,
  handleSubmitWidget,
}: CreateWidgetProps) {
  const { t } = useTranslation()
  const cancelButtonRef = useRef(null)
  const colorPickerRef = useRef()
  const [selectedIndex, setSelectedIndex] = useState(0)

  const { id: projectId } = storage.getProject()
  const [optionOrg, setOptionOrg] = useState({
    label: '',
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

  const [deviceValue, setDeviceValue] = useState<SelectOptionString[]>()
  const { data: deviceData } = useGetDevices({
    orgId: optionOrg?.value,
    projectId,
    config: {
      enabled: !!optionOrg?.value,
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

  return (
    <Dialog isOpen={isOpen} onClose={close} initialFocus={cancelButtonRef}>
      <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:p-6 sm:align-middle">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <div className="flex items-center justify-between">
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

          <FormMultipleFields<WidgetConfig, typeof widgetSchema>
            id="create-widget"
            className="flex flex-col justify-between"
            onSubmit={values => {
              // console.log('values: ', values)
              handleSubmitWidget({
                id: uuidv4(),
                title: values.title,
                type: widgetCategory,
                org_id: values.org_id,
                device: values.device,
                attributeConfig: values.attributeConfig,
                widgetSetting: values.widgetSetting,
              })
            }}
            schema={widgetSchema}
            name={['attributeConfig']}
          >
            {(
              { register, formState, control, setValue, watch },
              { fields, append, remove },
            ) => {
              console.log('zod errors', formState.errors)

              return (
                <>
                  {orgIsLoading ? (
                    <div className="flex grow items-center justify-center">
                      <Spinner showSpinner size="xl" />
                    </div>
                  ) : (
                    <>
                      <Tab.Group
                        selectedIndex={selectedIndex}
                        onChange={setSelectedIndex}
                      >
                        <Tab.List className="hidden">
                          <Tab
                            className={({ selected }) =>
                              clsx(
                                'py-2.5 text-body-sm hover:text-primary-400 focus:outline-none',
                                { 'text-primary-400': selected },
                              )
                            }
                          ></Tab>
                          <Tab
                            className={({ selected }) =>
                              clsx(
                                'py-2.5 text-body-sm hover:text-primary-400 focus:outline-none',
                                { 'text-primary-400': selected },
                              )
                            }
                          ></Tab>
                        </Tab.List>
                        <Tab.Panels className="mt-2 flex grow flex-col">
                          <Tab.Panel
                            className={clsx(
                              'flex grow flex-col bg-white focus:outline-none',
                            )}
                          >
                            <TitleBar
                              title={t('cloud:dashboard.config_chart.show')}
                              className="w-full rounded-md bg-gray-500 pl-3"
                            />
                            <div className="grid grid-cols-1 gap-x-4 px-2 py-6 md:grid-cols-5">
                              <InputField
                                label={t('cloud:dashboard.config_chart.name')}
                                error={formState.errors['title']}
                                registration={register('title')}
                                placeholder={t(
                                  'cloud:dashboard.config_chart.name',
                                )}
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
                                    orgFlattenData?.map(org => ({
                                      label: org?.name,
                                      value: org?.id,
                                    })) || [
                                      { label: t('loading:org'), value: '' },
                                    ]
                                  }
                                  onChange={e => {
                                    setOptionOrg(e)
                                    setValue('org_id', e?.value)
                                  }}
                                  value={optionOrg}
                                />
                                <p className="text-body-sm text-primary-400">
                                  {formState?.errors?.org_id?.message ===
                                  'Required'
                                    ? t(
                                        'cloud:org_manage.org_manage.add_org.choose_org',
                                      )
                                    : formState?.errors?.org_id?.message}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <SelectDropdown
                                  label={t(
                                    'cloud:dashboard.config_chart.device',
                                  )}
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
                                  isMulti
                                  value={deviceValue}
                                  onChange={(e: SelectOptionString[]) => {
                                    const entityIdsArr =
                                      e.length > 0
                                        ? e.map(item => {
                                            return item.value
                                          })
                                        : ['']
                                    setDeviceValue(e)
                                    setValue('device', entityIdsArr)
                                    attrChartMutate({
                                      data: {
                                        entity_ids: entityIdsArr,
                                        entity_type: 'DEVICE',
                                        time_series: true,
                                      },
                                    })
                                  }}
                                />
                                <p className="text-body-sm text-primary-400">
                                  {formState?.errors?.device?.message ===
                                  'Required'
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
                                className="w-full rounded-md bg-gray-500 pl-3"
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
                                className="mt-3 flex justify-between gap-x-2"
                                key={field.id}
                              >
                                <div className="grid grid-cols-1 gap-x-4 px-2 md:grid-cols-5">
                                  <div className="space-y-1">
                                    <FieldWrapper
                                      label={t(
                                        'cloud:dashboard.config_chart.attr',
                                      )}
                                      error={
                                        formState?.errors?.attributeConfig?.[
                                          index
                                        ]?.attribute_key
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
                                                    !value &&
                                                      'text-secondary-700',
                                                  )}
                                                >
                                                  {value !== ''
                                                    ? attrSelectData.find(
                                                        attr =>
                                                          attr.value === value,
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
                                                    {attrSelectData.map(
                                                      attr => (
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
                                                      ),
                                                    )}
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
                                    label={t(
                                      'cloud:dashboard.config_chart.label',
                                    )}
                                    error={
                                      formState?.errors?.attributeConfig?.[
                                        index
                                      ]?.label
                                    }
                                    registration={register(
                                      `attributeConfig.${index}.label` as const,
                                    )}
                                  />
                                  <div className="space-y-1">
                                    <FieldWrapper
                                      label={t(
                                        'cloud:dashboard.config_chart.color',
                                      )}
                                      error={
                                        formState?.errors?.attributeConfig?.[
                                          index
                                        ]?.color
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
                                    label={t(
                                      'cloud:dashboard.config_chart.unit',
                                    )}
                                    error={
                                      formState?.errors?.attributeConfig?.[
                                        index
                                      ]?.unit
                                    }
                                    registration={register(
                                      `attributeConfig.${index}.unit` as const,
                                    )}
                                  />
                                  <InputField
                                    label={t(
                                      'cloud:dashboard.config_chart.decimal',
                                    )}
                                    error={
                                      formState?.errors?.attributeConfig?.[
                                        index
                                      ]?.decimal
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
                              </section>
                            ))}
                          </Tab.Panel>
                          <Tab.Panel>
                            <TitleBar
                              title={t(
                                'cloud:dashboard.config_chart.widget_config',
                              )}
                              className="w-full rounded-md bg-gray-500 pl-3"
                            />
                            <div className="grid grid-cols-1 gap-x-4 px-2 py-6 md:grid-cols-5 ">
                              <SelectField
                                label={t('ws:filter.dataType')}
                                error={
                                  formState?.errors?.widgetSetting?.dataType
                                }
                                registration={register(
                                  `widgetSetting.dataType` as const,
                                )}
                                options={widgetDataType.map(dataType => ({
                                  label: dataType.label,
                                  value: dataType.value,
                                }))}
                              />

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
                                  label={t(
                                    'cloud:dashboard.config_chart.endDate',
                                  )}
                                  error={
                                    formState?.errors?.widgetSetting?.startDate
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
                                error={
                                  formState?.errors?.widgetSetting?.interval
                                }
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
                                registration={register(
                                  `widgetSetting.agg` as const,
                                )}
                                options={widgetAgg.map(agg => ({
                                  label: agg.label,
                                  value: agg.value,
                                }))}
                              />
                            </div>
                          </Tab.Panel>
                        </Tab.Panels>
                      </Tab.Group>
                    </>
                  )}
                </>
              )
            }}
          </FormMultipleFields>
        </div>

        <div className="mt-4 flex justify-center space-x-2">
          {widgetType === 'TIMESERIES' ? (
            <>
              {selectedIndex === 0 ? null : (
                <Button
                  className="rounded-sm border-none"
                  variant="secondaryLight"
                  size="square"
                  onClick={() =>
                    setSelectedIndex(selectedIndex =>
                      selectedIndex > 0 ? selectedIndex - 1 : 0,
                    )
                  }
                >
                  {t('btn:back')}
                </Button>
              )}
              {selectedIndex === 1 ? (
                <Button
                  className="rounded-sm border-none"
                  variant="primary"
                  form="create-widget"
                  type="submit"
                  size="square"
                >
                  {t('btn:confirm')}
                </Button>
              ) : (
                <Button
                  className="rounded-sm border-none"
                  variant="primary"
                  size="square"
                  onClick={() =>
                    setSelectedIndex(selectedIndex =>
                      selectedIndex < 1 ? selectedIndex + 1 : 1,
                    )
                  }
                >
                  {t('btn:next')}
                </Button>
              )}
            </>
          ) : (
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
          )}
        </div>
      </div>
    </Dialog>
  )
}
