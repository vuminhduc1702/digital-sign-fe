import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/Button'
import {
  Form,
  InputField,
  SelectDropdown,
  SelectOption
} from '~/components/Form'

import { XMarkIcon } from '@heroicons/react/24/outline'
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
// import { DateRange } from "react-day-picker"
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

export const configChartSchema = z.object({
  name: nameSchema,
  unit: z.string(),
  decimal: z.string()
})

export type CreateConfigChartDTO = {
  data: z.infer<typeof configChartSchema>
}

export const configChartChildSchema = z.object({
  device: z.string()
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
  device: string
  method: string
  attr: string
  date: any
  color: string
}

type CreateConfigChartProps = {
  type: string
  close: () => void
  isOpen: boolean
  handleSubmitChart: (value: any) => void
}
export function CreateConfigChart({ type, close, isOpen, handleSubmitChart }: CreateConfigChartProps) {
  const { t } = useTranslation()
  const params = useParams()
  const thingId = params.thingId as string
  const cancelButtonRef = useRef(null)
  const [offset, setOffset] = useState(0)
  // const [dateValue, setDate] = React.useState<DateRange | undefined>({
  //   from: undefined,
  //   to: undefined,
  // })
  const [color, setColor] = useState('#fff');
  const [dataConfigChart, setDataConfigChart] = useState<
    EntityConfigChart[]
  >([])
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

  const orgId = params.orgId as string
  const { id: projectId } = storage.getProject()
  const {
    data: deviceData,
  } = useGetDevices({
    orgId,
    projectId,
    offset,
    config: { keepPreviousData: true },
  })

  const { data: dataAttrChart, mutate, isLoading, isSuccess } = useCreateAttrChart()

  const deviceSelectData = deviceData?.devices.map(device => ({
    value: device.id,
    label: device.name,
  })) || [{ value: '', label: '' }]

  const attrSelectData = dataAttrChart?.key?.map(item => ({
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
    // setDate({
    //   from: undefined,
    //   to: undefined,
    // })
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
        <div className="flex flex-col gap-2 mt-2">
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
                name: values.name,
                unit: values.unit,
                decimal: values.decimal,
                dataConfigChart: dataConfigChart
              }
              handleSubmitChart(dataSubmit)
            }}
            schema={configChartSchema}
          >
            {({ register, formState }) => {
              return (
                <div className="grid grid-cols-1 gap-x-4 md:grid-cols-3 px-8 py-6 border border-solid border-inherit">
                  <InputField
                    label={t('cloud:dashboard.config_chart.name')}
                    error={formState.errors['name']}
                    registration={register('name')}
                  />
                  <InputField
                    label={t('cloud:dashboard.config_chart.unit')}
                    error={formState.errors['unit']}
                    registration={register('unit')}
                  />
                  <InputField
                    label={t('cloud:dashboard.config_chart.decimal')}
                    error={formState.errors['decimal']}
                    registration={register('decimal')}
                  />
                </div>
              )
            }}
          </Form>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <div className="flex justify-between gap-2 rounded-lg bg-secondary-400 px-4 py-2">
            <div className="flex gap-3">
              <p className="text-table-header">
              {t('cloud:dashboard.config_chart.title')}
              </p>
            </div>
          </div>

          <Form<CreateConfigChartChildDTO['data'], typeof configChartChildSchema>
            id="config-chart-child"
            className="flex flex-col justify-between"
            onSubmit={values => {
              const data = {
                device: deviceValue.label,
                method: methodValue.label,
                attr: attrValue.label,
                date: null,
                color: color
              }
              setDataConfigChart(pre => [...pre, data])
              resetData()
            }}
            schema={configChartChildSchema}
          >
            {({ register, formState, control, setValue }) => {
              return (
                <div className='px-8 py-6 border border-solid border-inherit'>
                  {dataConfigChart.length ?
                    <div className='mb-6'>
                      <ConfigChartTable
                        offset={offset}
                        setOffset={setOffset}
                        data={dataConfigChart || []}
                        total={0}
                        isPreviousData={false}
                      /></div> :
                    <div>{''}</div>}
                  <div className={cn(
                    "grid grid-cols-1 gap-x-4 ",
                    type === 'road' ? "md:grid-cols-6" : "md:grid-cols-5"
                  )}>
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
                              time_series: false
                            },
                          })
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
                    <div className="space-y-1 flex">
                      <div className='relative w-full'>
                        <p className='mb-1'>{t('cloud:dashboard.config_chart.date')}</p>
                        <Popover>
                          <PopoverTrigger asChild>
                            {/* <Button
                              id="date"
                              variant="trans"
                              size="square"
                              className={cn(
                                "relative w-full justify-start text-left font-normal rounded-md",
                                !dateValue && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateValue?.from ? (
                                dateValue.to ? (
                                  <>
                                    {format(dateValue.from, "dd/MM/y")} -{" "}
                                    {format(dateValue.to, "dd/MM/y")}
                                  </>
                                ) : (
                                  format(dateValue.from, "dd/MM/y")
                                )
                              ) : (
                                <span>{t('cloud:dashboard.config_chart.pick_date')}</span>
                              )}
                            </Button> */}
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            {/* <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={dateValue?.from}
                              selected={dateValue}
                              onSelect={setDate}
                              numberOfMonths={2}
                            /> */}
                          </PopoverContent>
                        </Popover>
                      </div>

                    </div>
                    <div className='space-y-1 relative w-full'>
                      <p className='mb-1'>{t('cloud:dashboard.config_chart.color')}</p>
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
                          <ColorPicker color={color} onChange={color => setColor(color.hex)} />
                        </PopoverContent>
                      </Popover>
                    </div>
                    {type === 'road' ? <div className="space-y-1">
                      <SelectDropdown
                        label={t('cloud:dashboard.config_chart.road')}
                        name="typeRoad"
                        isClearable={false}
                        control={control}
                        options={[
                          { label: 'Đường thẳng', value: 'Đường thẳng' },
                          { label: 'Đường nét đứt', value: 'Đường nét đứt' }
                        ]}
                        value={typeRoadValue}
                        onChange={e => {
                          setTypeRoadValue(e)
                        }}
                      />
                      <p className="text-body-sm text-primary-400">
                        {formState?.errors?.typeRoad?.message}
                      </p>
                    </div> : ''}
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button
                      className="h-9 w-9 rounded-md"
                      variant="trans"
                      size="square"
                      startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
                    />
                    <Button
                      form="config-chart-child"
                      type="submit"
                      size="md"
                      className="bg-primary-400"
                      startIcon={
                        <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
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
