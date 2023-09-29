import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import ColorPicker from 'react-pick-color'
import * as z from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { Tab } from '@headlessui/react'
import clsx from 'clsx'

import { Button } from '~/components/Button'
import {
  Form,
  FormMultipleFields,
  InputField,
  SelectDropdown,
  type SelectOption,
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

import { nameSchema, selectOptionSchema } from '~/utils/schemaValidation'

import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

import { Calendar as CalendarIcon } from 'lucide-react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { PlusIcon } from '~/components/SVGIcons'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'

const widgetAggSchema = z.object({
  label: z.string(),
  value: z.enum(['NONE', 'AVG', 'MIN', 'MAX', 'SUM' ,'COUNT'] as const)
})
export type WidgetAgg = z.infer<typeof widgetAggSchema>

export const widgetConfigSchema = z.object({
  id: z.string().optional(),
  org_id: z.string(),
  device: z.array(z.string()),
  attribute_config: z.array(z.object({
    id: z.string().optional(),
    attr: z.string(),
    label: z.string(),
    color: z.string(),
    unit: z.string(),
    decimal: z.string(),
  })),
  widgetSetting: z.object({
    agg: widgetAggSchema,
    dataType: selectOptionSchema(),
    startDate: z.number(),
    endDate: z.number(),
    interval: selectOptionSchema(z.number()),
    widgetType: selectOptionSchema()
  }),
});

export type WidgetConfigDTO = {
  data: z.infer<typeof widgetConfigSchema>
}

type CreateWidgetProps = {
  widgetType: string
  isOpen: boolean
  close: () => void
  handleSubmitChart: (value: any) => void
}

const wsDataType = [
  { label: 'Realtime', value: 'real' },
  { label: 'History', value: 'hist' },
]

export function CreateWidget({
  widgetType,
  isOpen,
  close,
  handleSubmitChart,
}: CreateWidgetProps) {
  const { t } = useTranslation()
  const cancelButtonRef = useRef(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [color, setColor] = useState('#FF0000')
  const [dataConfigChart, setDataConfigChart] = useState([])
  const [interval, setInterval] = useState({
    label: '',
    value: '',
  })
  const [agg, setAgg] = useState({
    label: '',
    value: '',
  })
  const [dataType, setDataType] = useState(wsDataType[0])

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

  const [deviceValue, setDeviceValue] = useState(
    Array<{
      label: ''
      value: ''
    }>,
  )
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

  const [attrValue, setAttrValue] = useState({
    label: '',
    value: '',
  })
  const { data: attrChartData, mutate } = useCreateAttrChart({
    config: {
      enabled: !!attrValue?.value,
      suspense: false,
    },
  })
  const attrSelectData = attrChartData?.keys?.map(item => ({
    value: item,
    label: item,
  })) || [{ value: '', label: '' }]

  return (
    <Dialog isOpen={isOpen} onClose={close} initialFocus={cancelButtonRef}>
      <div className="thing-service-popup inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
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

          <FormMultipleFields<WidgetConfigDTO['data'], typeof widgetConfigSchema>
            id="config-chart-parent-1"
            className="flex flex-col justify-between"
            onSubmit={values => {
              console.log('values: ', values)
              // const deviceValueArr = deviceValue.map((item: any) => {
              //   return item.value
              // })
              // const dataSubmit = {
              //   id: uuidv4(),
              //   org_id: values.org_id,
              //   device: deviceValueArr,
              //   dataConfigChart: dataConfigChart,
              // }
              // handleSubmitChart(dataSubmit)
            }}
            schema={widgetConfigSchema}
            name={['attribute_config']}
          >
            {({ register, formState, control, setValue }, { fields, append, remove }) => {
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
                        <Tab.List className="mt-2 flex justify-between gap-x-10 bg-secondary-500 px-10">
                          <Tab
                            className={({ selected }) =>
                              clsx(
                                'py-2.5 text-body-sm hover:text-primary-400 focus:outline-none',
                                { 'text-primary-400': selected },
                              )
                            }
                          >
                            <div className="flex items-center gap-x-2">
                              <p>{t('cloud:custom_protocol.protocol')}</p>
                            </div>
                          </Tab>
                          <Tab
                            className={({ selected }) =>
                              clsx(
                                'py-2.5 text-body-sm hover:text-primary-400 focus:outline-none',
                                { 'text-primary-400': selected },
                              )
                            }
                          >
                            <div className="flex items-center gap-x-2">
                              <p>{t('cloud:custom_protocol.thing.title')}</p>
                            </div>
                          </Tab>
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
                            <div className="grid grid-cols-1 gap-x-4 px-8 py-6 md:grid-cols-5">
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
                                    ? t(
                                        'cloud:org_manage.org_manage.add_org.choose_org',
                                      )
                                    : formState?.errors?.org_id?.message}
                                </p>
                              </div>
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
                                isMulti
                                value={deviceValue}
                                onChange={e => {
                                  const entityIdsArr =
                                    e.length > 0
                                      ? e.map((item: any) => {
                                          return item.value
                                        })
                                      : [null]
                                  setDeviceValue(e)
                                  setValue('device', e?.value)
                                  mutate({
                                    data: {
                                      entity_ids: entityIdsArr,
                                      entity_type: 'DEVICE',
                                      time_series: false,
                                    },
                                  })
                                }}
                              />
                              <p className="text-body-sm text-primary-400">
                                {formState?.errors?.device?.message}
                              </p>
                            </div>
                            <div className="flex justify-between space-x-3">
                              <TitleBar
                                title={t('cloud:dashboard.detail_dashboard.add_widget.data_chart')}
                                className="w-full rounded-md bg-gray-500 pl-3"
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
                                onClick={() => append({ attr: '', label: '', color: '', unit: '', decimal: '', id: '' })}
                              />
                            </div>
                            {fields.map((field, index) => (
                              <section
                                className="flex justify-between gap-x-2"
                                style={{ marginTop: 10 }}
                                key={field.id}
                              >
                                <div className="grid grid-cols-1 gap-x-4 px-8 md:grid-cols-5">
                                  <div className="space-y-1">
                                    <SelectDropdown
                                      label={t('cloud:dashboard.config_chart.attr')}
                                      name={`attribute_config.${index}.attr`}
                                      isClearable={false}
                                      control={control}
                                      options={
                                        attrChartData?.keys != null
                                          ? attrSelectData
                                          : attrChartData?.keys == null
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
                                        option.label === t('loading:attr') ||
                                        option.label === t('table:no_attr')
                                      }
                                      value={attrValue}
                                      onChange={e => setAttrValue(e)}
                                      maxMenuHeight={150}
                                    />
                                    <p className="text-body-sm text-primary-400">
                                      {formState?.errors?.attribute_config?.[index]?.attr?.message}
                                    </p>
                                  </div>
                                  <InputField
                                    label={t('cloud:dashboard.config_chart.label')}
                                    error={formState?.errors?.attribute_config?.[index]?.label}
                                    registration={register(
                                      `attribute_config.${index}.label` as const,
                                    )}
                                  />
                                  <div className="space-y-1">
                                    <p className="mb-1">
                                      {t('cloud:dashboard.config_chart.color')}
                                    </p>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          className="relative w-full rounded-md"
                                          variant="trans"
                                          size="square"
                                        >
                                          {color}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                      >
                                        <ColorPicker
                                          color={color}
                                          onChange={color => {
                                            const rgba = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`
                                            setColor(rgba)
                                          }}
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                  <InputField
                                    label={t('cloud:dashboard.config_chart.unit')}
                                    error={formState?.errors?.attribute_config?.[index]?.unit}
                                    registration={register(
                                      `attribute_config.${index}.unit` as const,
                                    )}
                                  />
                                  <InputField
                                    label={t(
                                      'cloud:dashboard.config_chart.decimal',
                                    )}
                                    error={formState?.errors?.attribute_config?.[index]?.decimal}
                                    registration={register(`attribute_config.${index}.decimal` as const)}
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
                        </Tab.Panels>
                      </Tab.Group>
                      <div className="mt-2 flex flex-col gap-2">
                        {/* <div className="flex justify-between gap-2 rounded-lg bg-secondary-400 px-4 py-2">
                          <div className="flex gap-3">
                            <p className="text-table-header">
                              {t('cloud:dashboard.config_chart.title')}
                            </p>
                          </div>
                        </div> */}
    
                        {/* <Form<CreateConfigChartChildDTO['data']>
                          id="config-chart-child"
                          className="flex flex-col justify-between"
                          onSubmit={values => {
                            const data = {
                              id: uuidv4(),
                              attr: attrValue.label,
                              label: values.label,
                              color: color,
                              // unit: values.unit,
                              // decimal: values.decimal,
                            }
                            setDataConfigChart(pre => [...pre, data])
                          }}
                        >
                          {({ register, formState, control }) => {
                            return ()
                          }}
                        </Form> */}
                      </div>
                      <div className="grid grid-cols-1 gap-x-4 border border-solid border-inherit px-8 py-6 md:grid-cols-5">
                        {/* <Form<CreateConfigChartDTO['data']>
                          id="config-chart-parent-2"
                          className="flex flex-col justify-between"
                          onSubmit={values => {
                            const deviceValueArr = deviceValue.map((item: any) => {
                              return item.value
                            })
                            const chartSetting = {
                              startDate: startDate?.getTime(),
                              endDate: endDate?.getTime(),
                              interval: interval,
                              agg: agg,
                              dataType: dataType,
                              widgetType: widgetType,
                            }
                            const data = {
                              id: uuidv4(),
                              org_id: values.org_id,
                              device: deviceValueArr,
                              chartSetting: chartSetting,
                              dataConfigChart: dataConfigChart,
                            }
                            handleSubmitChart(data)
                          }}
                        >
                          {({ register, formState, control }) => {
                            return (
                              <div>
                                <div className="flex space-y-1">
                                  <SelectDropdown
                                    name="dataType"
                                    isClearable={false}
                                    control={control}
                                    options={wsDataType}
                                    value={dataType}
                                    defaultValue={dataType}
                                    onChange={e => {
                                      setDataType(e)
                                    }}
                                  />
                                </div>
      
                                <div className="flex space-y-1">
                                  <div className="relative w-full">
                                    <p className="mb-1">
                                      {t('cloud:dashboard.config_chart.startDate')}
                                    </p>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          id="date"
                                          variant="trans"
                                          size="square"
                                          className={cn(
                                            'relative w-full justify-start rounded-md text-left font-normal',
                                            !startDate && 'text-muted-foreground',
                                          )}
                                        >
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {startDate ? (
                                            <>{format(startDate, 'dd/MM/y')}</>
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
                                          initialFocus
                                          mode="single"
                                          defaultMonth={new Date()}
                                          selected={startDate}
                                          onSelect={setStartDate}
                                          numberOfMonths={1}
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                </div>
      
                                <div className="flex space-y-1">
                                  <div className="relative w-full">
                                    <p className="mb-1">
                                      {t('cloud:dashboard.config_chart.endDate')}
                                    </p>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          id="date"
                                          variant="trans"
                                          size="square"
                                          className={cn(
                                            'relative w-full justify-start rounded-md text-left font-normal',
                                            !endDate && 'text-muted-foreground',
                                          )}
                                        >
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {endDate ? (
                                            <>{format(endDate, 'dd/MM/y')}</>
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
                                          initialFocus
                                          mode="single"
                                          defaultMonth={new Date()}
                                          selected={endDate}
                                          onSelect={setEndDate}
                                          numberOfMonths={1}
                                          disabled={{ before: startDate }}
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                </div>
                                <div className="flex space-y-1">
                                  <SelectDropdown
                                    label={t('ws:filter.interval')}
                                    name="interval"
                                    isClearable={false}
                                    control={control}
                                    options={wsInterval}
                                    value={interval}
                                    onChange={e => {
                                      setInterval(e)
                                    }}
                                  />
                                </div>
                                <div className="flex space-y-1">
                                  <SelectDropdown
                                    label={t('ws:filter.data_aggregation')}
                                    name="interval"
                                    isClearable={false}
                                    control={control}
                                    options={widgetAgg}
                                    value={agg}
                                    onChange={e => {
                                      setAgg(e)
                                    }}
                                  />
                                </div>
                              </div>
                            )
                          }}
                        </Form> */}
                      </div>
                    </>
                  )}
                </>
              )
            }}
          </FormMultipleFields>
        </div>

        <div className="mt-4 flex justify-center space-x-2">
          {widgetType === 'timeseries' ? (
            <div>
              <Button
                className="rounded-sm border-none"
                style={{ justifyContent: 'flex-start' }}
                variant="secondary"
                size="square"
                onClick={() =>
                  setSelectedIndex(selectedIndex =>
                    selectedIndex > 0 ? selectedIndex - 1 : 0,
                  )
                }
                disabled={selectedIndex === 0}
              >
              {t('btn:back')}
            </Button>
            <Button
              className="rounded-sm border-none"
              style={{ justifyContent: 'flex-start' }}
              variant="secondary"
              size="square"
              onClick={() =>
                setSelectedIndex(selectedIndex =>
                  selectedIndex < 1 ? selectedIndex + 1 : 1,
                )
              }
              disabled={selectedIndex === 1}
            >
              {t('btn:next')}
            </Button>
            </div>
          ) : (
            <div className="mt-4 flex justify-center space-x-2">
              <Button
                type="button"
                variant="secondary"
                className="inline-flex w-full justify-center rounded-md border focus:ring-1 focus:ring-secondary-700 focus:ring-offset-1 sm:mt-0 sm:w-auto sm:text-body-sm"
                onClick={close}
                startIcon={
                  <img src={btnCancelIcon} alt="Cancel" className="h-5 w-5" />
                }
                ref={cancelButtonRef}
              />
              <Button
                form="config-chart-parent"
                type="submit"
                size="md"
                className="bg-primary-400"
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
