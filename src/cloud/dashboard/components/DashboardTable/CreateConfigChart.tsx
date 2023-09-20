import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/Button'
import {
  Form,
  InputField,
  SelectDropdown,
  SelectOption,
} from '~/components/Form'

import { XMarkIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import ColorPicker from 'react-pick-color'
import { useParams } from 'react-router-dom'
import * as z from 'zod'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { useGetDevices } from '~/cloud/orgManagement/api/deviceAPI'
import { Dialog, DialogTitle } from '~/components/Dialog'
import { PlusIcon } from '~/components/SVGIcons'
import { cn } from '~/utils/misc'
import { nameSchema } from '~/utils/schemaValidation'
import storage from '~/utils/storage'
import { useCreateAttrChart } from '../../api'
import { Calendar } from '../Calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../Popover'
import { ConfigChartTable } from './ConfigChartTable'
import { type WSAgg } from '../../types'
import {v4 as uuidv4} from 'uuid'
import { ComboBoxSelectOrg } from '~/layout/MainLayout/components/ComboBoxSelectOrg'
import { useDefaultCombobox } from '~/utils/hooks'
import { OrgMapType } from '~/layout/OrgManagementLayout/components/OrgManageSidebar'

export const configChartSchema = z.object({
  name: nameSchema,
  unit: z.string(),
  decimal: z.string()
})

export type CreateConfigChartDTO = {
  data: {
    org: string,
    device: string[]
  }
}

export const configChartChildSchema = z.object({
  device: z.string(),
})

export type CreateConfigChartChildDTO = {
  data: {
    device: string
    method: string
    attr: string
    typeRoad: string
  }
}

export type EntityConfigChart = {
  org: string
  device: string
  method: string
  attr: string
  date: any
  color: string
  id: string
}

type CreateConfigChartProps = {
  type: string
  close: () => void
  isOpen: boolean
  handleSubmitChart: (value: any) => void
}
export function CreateConfigChart({
  type,
  close,
  isOpen,
  handleSubmitChart,
}: CreateConfigChartProps) {
  const { t } = useTranslation()
  const params = useParams()
  const thingId = params.thingId as string
  const defaultComboboxOrgData = useDefaultCombobox('org')
  const cancelButtonRef = useRef(null)
  const [offset, setOffset] = useState(0)
  const [dateValue, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })
  const [color, setColor] = useState('#fff')
  const [dataConfigChart, setDataConfigChart] = useState<EntityConfigChart[]>(
    [],
  )
  const [deviceValue, setDeviceValue] = useState<SelectOption>({
    label: '',
    value: '',
  })
  const [attrValue, setAttrValue] = useState<SelectOption>({
    label: '',
    value: '',
  })
  const [methodValue, setMethodValue] = useState<SelectOption>({
    label: '',
    value: '',
  })
  const [typeRoadValue, setTypeRoadValue] = useState<SelectOption>({
    label: '',
    value: '',
  })
  const [interval, setInterval] = useState<SelectOption>({
    label: '',
    value: '',
  })
  const [agg, setAgg] = useState<SelectOption>({
    label: '',
    value: '',
  })

  const orgId = params.orgId as string
  const { id: projectId } = storage.getProject()
  const { data: deviceData } = useGetDevices({
    orgId,
    projectId,
    offset,
    config: { keepPreviousData: true },
  })

  const {
    data: dataAttrChart,
    mutate,
    isLoading,
    isSuccess,
  } = useCreateAttrChart()

  const [filteredComboboxData, setFilteredComboboxData] = useState<
    OrgMapType[]
  >([])
  const selectedOrgId =
    filteredComboboxData.length !== 1 ? '' : filteredComboboxData[0]?.id

  const wsInterval = [
    { label: 'Second', value: 1000 },
    { label: 'Minute', value: 60 * 1000 },
    { label: 'Hour', value: 60 * 60 * 1000 },
    { label: 'Day', value: 24 * 60 * 60 * 1000 },
    { label: 'Week', value: 7 * 24 * 60 * 60 * 1000 },
    { label: 'Month', value: 30 * 24 * 60 * 60 * 1000 },
    { label: 'Year', value: 365 * 24 * 60 * 60 * 1000 },
  ]

  const wsAgg: WSAgg[] = [
    { label: 'None', value: 'NONE' },
    { label: 'Avg', value: 'AVG' },
    { label: 'Min', value: 'MIN' },
    { label: 'Max', value: 'MAX' },
    { label: 'Sum', value: 'SUM' },
    { label: 'Count', value: 'COUNT' },
  ]

  const deviceSelectData = deviceData?.devices.map(device => ({
    value: device.id,
    label: device.name,
  })) || [{ value: '', label: '' }]

  const attrSelectData = dataAttrChart?.keys?.map(item => ({
    value: item,
    label: item,
  })) || [{ value: '', label: '' }]

  const resetData = () => {
    setDeviceValue({
      label: '',
      value: '',
    })
    setAttrValue({
      label: '',
      value: '',
    })
    setMethodValue({
      label: '',
      value: '',
    })
    setColor('#fff')
    setDate({
      from: undefined,
      to: undefined,
    })
  }

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
        </div>
        <div className="mt-2 flex flex-col gap-2">
          <div className="flex justify-between gap-2 rounded-lg bg-secondary-400 px-4 py-2">
            <div className="flex gap-3">
              <p className="text-table-header">
                {t('cloud:dashboard.config_chart.show')}
              </p>
            </div>
          </div>
          <Form<CreateConfigChartDTO['data'], typeof configChartSchema>
            id="config-chart-parent"
            className="flex flex-col justify-between"
            onSubmit={values => {
              const dataSubmit = {
                org: values.org,
                device: values.device,
                dataConfigChart: dataConfigChart,
              }
              handleSubmitChart(dataSubmit)
            }}
            schema={configChartSchema}
          >
            {({ register, formState, control, setValue }) => {
              return (
                <div className="grid grid-cols-1 gap-x-4 border border-solid border-inherit px-8 py-6 md:grid-cols-5">
                  <ComboBoxSelectOrg
                    label={
                      t('cloud:org_manage.user_manage.add_user.parent') ??
                      'Parent organization'
                    }
                    setFilteredComboboxData={setFilteredComboboxData}
                    hasDefaultComboboxData={defaultComboboxOrgData}
                  />
                  <SelectDropdown
                    label={t('cloud:dashboard.config_chart.device')}
                    name="device"
                    isClearable={false}
                    control={control}
                    options={deviceSelectData}
                    value={deviceValue}
                    isMulti={true}
                    onChange={e => {
                      setDeviceValue(e)
                      setValue('device', e?.value)
                      mutate({
                        data: {
                          entity_ids: [e?.value],
                          entity_type: 'DEVICE',
                          time_series: false,
                        },
                      })
                      setAttrValue({label: '', value: ''})
                    }}
                  />
                  <p className="text-body-sm text-primary-400">
                    {formState?.errors?.device?.message}
                  </p>
                  {/* <InputField
                    label={t('cloud:dashboard.config_chart.unit')}
                    error={formState.errors['unit']}
                    registration={register('unit')}
                  />
                  <InputField
                    label={t('cloud:dashboard.config_chart.decimal')}
                    error={formState.errors['decimal']}
                    registration={register('decimal')}
                  />
                  <div className="space-y-1">
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
                  <div className="space-y-1">
                    <SelectDropdown
                      label={t('ws:filter.data_aggregation')}
                      name="interval"
                      isClearable={false}
                      control={control}
                      options={wsAgg}
                      value={agg}
                      onChange={e => {
                        setAgg(e)
                      }}
                    />
                  </div> */}

                </div>
              )
            }}
          </Form>
        </div>

        <div className="mt-2 flex flex-col gap-2">
          <div className="flex justify-between gap-2 rounded-lg bg-secondary-400 px-4 py-2">
            <div className="flex gap-3">
              <p className="text-table-header">
                {t('cloud:dashboard.config_chart.title')}
              </p>
            </div>
          </div>

          <Form<
            CreateConfigChartChildDTO['data'],
            typeof configChartChildSchema
          >
            id="config-chart-child"
            className="flex flex-col justify-between"
            onSubmit={values => {
              const data = {
                device: deviceValue.label,
                method: methodValue.label,
                attr: attrValue.label,
                date: dateValue,
                color: color,
                id: uuidv4()
              }
              setDataConfigChart(pre => [...pre, data])
              resetData()
            }}
            schema={configChartChildSchema}
          >
            {({ register, formState, control, setValue }) => {
              return (
                <div className="border border-solid border-inherit px-8 py-6">
                  {dataConfigChart.length ? (
                    <div className="mb-6">
                      <ConfigChartTable
                        offset={offset}
                        setOffset={setOffset}
                        data={dataConfigChart || []}
                        handleDataChart={(values) => setDataConfigChart(values)}
                        total={0}
                        isPreviousData={false}
                      />
                    </div>
                  ) : (
                    <div>{''}</div>
                  )}
                  <div
                    className={cn(
                      'grid grid-cols-1 gap-x-4 ',
                      type === 'road' ? 'md:grid-cols-6' : 'md:grid-cols-5',
                    )}
                  >
                    <div className="space-y-1">
                      <SelectDropdown
                        label={t('cloud:dashboard.config_chart.device')}
                        name="device"
                        isClearable={false}
                        control={control}
                        options={deviceSelectData}
                        value={deviceValue}
                        onChange={e => {
                          setDeviceValue(e)
                          setValue('device', e?.value)
                          mutate({
                            data: {
                              entity_ids: [e?.value],
                              entity_type: 'DEVICE',
                              time_series: false,
                            },
                          })
                          setAttrValue({label: '', value: ''})
                        }}
                      />
                      <p className="text-body-sm text-primary-400">
                        {formState?.errors?.device?.message}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <SelectDropdown
                        label={t('cloud:dashboard.config_chart.attr')}
                        name="attr"
                        isClearable={false}
                        control={control}
                        options={attrSelectData}
                        value={attrValue}
                        onChange={e => setAttrValue(e)}
                        maxMenuHeight={150}
                      />
                      <p className="text-body-sm text-primary-400">
                        {formState?.errors?.attr?.message}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <SelectDropdown
                        label={t('cloud:dashboard.config_chart.method')}
                        name="method"
                        isClearable={false}
                        control={control}
                        options={[{ label: '', value: '' }]}
                        value={methodValue}
                        onChange={e => setMethodValue(e)}
                      />
                      <p className="text-body-sm text-primary-400">
                        {formState?.errors?.method?.message}
                      </p>
                    </div>
                    <div className="flex space-y-1">
                      <div className="relative w-full">
                        <p className="mb-1">
                          {t('cloud:dashboard.config_chart.date')}
                        </p>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="date"
                              variant="trans"
                              size="square"
                              className={cn(
                                'relative w-full justify-start rounded-md text-left font-normal',
                                !dateValue && 'text-muted-foreground',
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateValue?.from ? (
                                dateValue.to ? (
                                  <>
                                    {format(dateValue.from, 'dd/MM/y')} -{' '}
                                    {format(dateValue.to, 'dd/MM/y')}
                                  </>
                                ) : (
                                  format(dateValue.from, 'dd/MM/y')
                                )
                              ) : (
                                <span>
                                  {t('cloud:dashboard.config_chart.pick_date')}
                                </span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={dateValue?.from}
                              selected={dateValue}
                              onSelect={setDate}
                              numberOfMonths={2}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="relative w-full space-y-1">
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
                        <PopoverContent className="w-auto p-0" align="start">
                          <ColorPicker
                            color={color}
                            onChange={color => {
                              const rgba = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`
                              setColor(rgba)
                            }
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    {type === 'road' ? (
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
                    ) : (
                      ''
                    )}
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button
                      className="h-9 w-9 rounded-md"
                      variant="trans"
                      size="square"
                      startIcon={
                        <PlusIcon width={16} height={16} viewBox="0 0 16 16" />
                      }
                    />
                    <Button
                      form="config-chart-child"
                      type="submit"
                      size="md"
                      className="bg-primary-400"
                      startIcon={
                        <img
                          src={btnSubmitIcon}
                          alt="Submit"
                          className="h-5 w-5"
                        />
                      }
                    ></Button>
                  </div>
                </div>
              )
            }}
          </Form>
        </div>
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
          ></Button>
        </div>
      </div>
    </Dialog>
  )
}
