import storage from '@/utils/storage'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/Spinner'
import { type SendMessage } from 'react-use-websocket/dist/lib/types'
import { LuTrash2, LuPlusCircle } from 'react-icons/lu'
import { cn } from '@/utils/misc'
import { zodResolver } from '@hookform/resolvers/zod'
import { SelectDropdown } from '@/components/Form'
import { type SelectInstance } from 'react-select'
import { useGetEntityThings } from '@/cloud/customProtocol/api/entityThing'
import { useGetServiceThings } from '@/cloud/customProtocol/api/serviceThing'
import { useThingServiceById } from '@/cloud/flowEngineV2/api/thingServiceAPI/getThingServiceById'
import { useTranslation } from 'react-i18next'
import { type controllerBtnSchema } from '../Widget'
import { z } from 'zod'
import i18n from '@/i18n'

const configControllerFormSchema = z.object({
  name: z.string().min(1, {
    message: i18n.t(
      'cloud:dashboard.detail_dashboard.add_widget.controller.error.name',
    ),
  }),
  thing_id: z.string().min(1, {
    message: i18n.t(
      'cloud:dashboard.detail_dashboard.add_widget.controller.error.thing_id',
    ),
  }),
  service_name: z.string().min(1, {
    message: i18n.t(
      'cloud:dashboard.detail_dashboard.add_widget.controller.error.service_name',
    ),
  }),
  input: z
    .array(
      z.object({
        name: z.string().min(1, {
          message: i18n.t(
            'cloud:dashboard.detail_dashboard.add_widget.controller.error.input',
          ),
        }),
        value: z.unknown(),
      }),
    )
    .refine(
      input => {
        const names = input.map(item => item.name)
        const uniqueNames = new Set(names)
        return uniqueNames.size === names.length
      },
      {
        message: i18n.t(
          'cloud:dashboard.detail_dashboard.add_widget.controller.error.unique_name',
        ),
      },
    ),
})

type ControllerFormSchema = z.infer<typeof configControllerFormSchema>

export function ControllerForm({
  name,
  data,
  sendMessage,
  isEdit,
  setIsEdit,
  setWidgetList,
  widgetInfo,
  widgetId,
}: {
  name: string
  data: string
  sendMessage: SendMessage
  isEdit: boolean
  setIsEdit: (value: boolean) => void
  setWidgetList: (value: any) => void
  widgetInfo?: z.infer<typeof controllerBtnSchema>
  widgetId: string
}) {
  const { t } = useTranslation()
  const projectId = storage.getProject()?.id
  const widgetInfoMemo = useMemo(() => widgetInfo, [widgetInfo])
  const { input, service_name, thing_id } = JSON.parse(data).executorCmds[0]
  const [variableListRerender, setVariableListRerender] = useState(false)
  const selectDropdownServiceRef = useRef<SelectInstance | null>(null)

  function getDefaultInput() {
    return {
      name: name,
      thing_id: thing_id,
      service_name: service_name,
      input: Object.entries(input).map(([key, value]) => ({
        name: key,
        value: value,
      })),
    }
  }

  function handleSendMessage() {
    sendMessage(
      JSON.stringify({
        executorCmds: [
          {
            project_id: projectId,
            thing_id,
            service_name,
            input,
          },
        ],
      }),
    )
  }

  const form = useForm<ControllerFormSchema>({
    resolver: zodResolver(configControllerFormSchema),
    defaultValues: getDefaultInput() || {
      name: name,
      thing_id: thing_id,
      service_name: service_name,
      input: [{ name: '', value: '' }],
    },
  })

  useEffect(() => {
    form.reset(getDefaultInput())
  }, [data])

  const { register, control, watch, handleSubmit, formState, setValue } = form

  const { fields, append, remove } = useFieldArray({
    name: 'input',
    control: control,
  })

  // select thing list
  const { data: thingData, isLoading: isLoadingThing } = useGetEntityThings({
    projectId,
  })
  const thingSelectData = thingData?.data?.list?.map(thing => ({
    value: thing.id,
    label: thing.name,
  }))

  // select service list
  const { data: serviceData, isLoading: isLoadingThingService } =
    useGetServiceThings({
      thingId: watch('thing_id'),
      config: {
        enabled: !!watch('thing_id'),
      },
    })
  const serviceSelectData = serviceData?.data?.map(service => ({
    value: service.name,
    label: service.name,
  }))

  // select variable list
  const { data: thingServiceData, isLoading: isLoadingService } =
    useThingServiceById({
      thingId: watch('thing_id'),
      name: watch('service_name'),
      config: {
        enabled: !!watch('thing_id') && !!watch('service_name'),
      },
    })
  const inputSelectData = thingServiceData?.data?.input?.map(input => ({
    value: input.name,
    label: input.name,
    type: input.type,
  }))

  useEffect(() => {
    if (variableListRerender) {
      remove()
      inputSelectData?.forEach((item, index) => {
        append({ name: item.value, value: '' })
      })
      setVariableListRerender(false)
    }
  }, [inputSelectData])

  return (
    <div className="relative mt-6 h-[calc(100%_-_24px)] bg-white p-6">
      <Form {...form}>
        <form
          className="box-border max-h-[80%] overflow-y-auto"
          onSubmit={handleSubmit(values => {
            const controllerBtn = {
              title: values.name,
              description: widgetInfoMemo?.description ?? 'LINE',
              datasource: {
                controller_message: JSON.stringify({
                  executorCmds: [
                    {
                      project_id: projectId,
                      thing_id: values.thing_id,
                      service_name: values.service_name,
                      input: (
                        values.input as {
                          name: string
                          value: string | boolean
                        }[]
                      ).reduce(
                        (acc, curr) => {
                          acc[curr.name] = curr.value
                          return acc
                        },
                        {} as { [key: string]: string | boolean },
                      ),
                    },
                  ],
                }),
                thing_id: JSON.stringify(values.thing_id),
                handle_service: JSON.stringify(values.service_name),
              },
              id: widgetInfoMemo?.id,
            }

            setWidgetList(prev => ({
              ...prev,
              ...{ [widgetId]: controllerBtn },
            }))

            setIsEdit(false)
          })}
        >
          <div className="grid grid-cols-1 gap-4 rounded-lg">
            {isEdit && (
              <div className="mr-5 flex flex-col gap-[16px] rounded-lg border p-[10px]">
                <div className="flex items-center rounded-lg bg-[#ECECEE] px-[12px] py-[8px] text-lg font-bold text-[#001737]">
                  {t('cloud:dashboard.config_chart.show')}
                </div>
                <div className="flex flex-col gap-[16px] text-sm">
                  <>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="grid grid-cols-[1fr_2fr] gap-[10px]">
                              <div className="flex items-center gap-[10px]">
                                {t('cloud:dashboard.config_chart.name')}
                                <span className="text-primary-400">*</span>
                              </div>
                              <div>
                                <Input
                                  {...field}
                                  className="w-[90%] rounded-md px-[10px] py-[8px]"
                                  defaultValue={watch('name')}
                                  disabled={!isEdit}
                                />
                                {formState.errors.name && (
                                  <FormMessage>
                                    {formState.errors.name?.message}
                                  </FormMessage>
                                )}
                              </div>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </>
                  <>
                    <div className="grid grid-cols-[1fr_2fr] gap-[10px]">
                      <div className="flex items-center gap-[10px]">
                        {t('cloud:custom_protocol.thing.choose')}
                        <span className="text-primary-400">*</span>
                      </div>
                      <SelectDropdown
                        name="thing_id"
                        control={control}
                        options={thingSelectData}
                        isOptionDisabled={option =>
                          option.label === t('loading:entity_thing') ||
                          option.label === t('table:no_thing')
                        }
                        noOptionsMessage={() => t('table:no_thing')}
                        loadingMessage={() => t('loading:entity_thing')}
                        isLoading={isLoadingThing}
                        defaultValue={thingSelectData?.find(
                          item => item.value === watch('thing_id'),
                        )}
                        placeholder={t('cloud:custom_protocol.thing.choose')}
                        handleClearSelectDropdown={() =>
                          selectDropdownServiceRef.current?.clearValue()
                        }
                        handleChangeSelect={() =>
                          selectDropdownServiceRef.current?.clearValue()
                        }
                        error={formState?.errors?.thing_id}
                        className="h-[36px] w-[90%] rounded-md focus:ring-2 focus:ring-blue-500"
                        customOnChange={value => {
                          setValue('service_name', '')
                          setValue('input', [
                            {
                              name: '',
                              value: '',
                            },
                          ])
                        }}
                      />
                    </div>
                  </>
                  <>
                    <div className="grid grid-cols-[1fr_2fr] gap-[10px]">
                      <div className="flex items-center gap-[10px]">
                        {t('cloud:custom_protocol.service.title')}
                        <span className="text-primary-400">*</span>
                      </div>
                      <SelectDropdown
                        refSelect={selectDropdownServiceRef}
                        name="service_name"
                        control={control}
                        options={serviceSelectData}
                        isOptionDisabled={option =>
                          option.label === t('loading:service_thing') ||
                          option.label === t('table:no_service')
                        }
                        isLoading={
                          watch('thing_id') != null ? isLoadingService : false
                        }
                        defaultValue={serviceSelectData?.find(
                          item => item.value === watch('service_name'),
                        )}
                        loadingMessage={() => t('loading:service_thing')}
                        noOptionsMessage={() => t('table:no_service')}
                        placeholder={t('cloud:custom_protocol.service.choose')}
                        error={formState?.errors?.service_name}
                        className="h-[36px] w-[90%] rounded-md focus:ring-2 focus:ring-blue-500"
                        customOnChange={value => {
                          if (value) {
                            setVariableListRerender(true)
                          }
                          setValue('input', [
                            {
                              name: '',
                              value: '',
                            },
                          ])
                        }}
                      />
                    </div>
                  </>
                </div>
              </div>
            )}
            <div className="mr-5 flex flex-col gap-[16px] rounded-lg border p-[10px]">
              <div className="flex items-center rounded-lg bg-[#ECECEE] px-[12px] py-[8px] text-lg font-bold text-[#001737]">
                {t(
                  'cloud:dashboard.detail_dashboard.add_widget.controller.input_list',
                )}
              </div>
              <>
                <div
                  className={cn(
                    `m-2 grid items-center gap-4 rounded-md border-b p-4`,
                    isEdit ? 'grid-cols-3' : 'grid-cols-2',
                  )}
                >
                  <div className="text-md flex items-center justify-center font-bold">
                    {t('cloud:custom_protocol.service.input')}
                  </div>
                  <div className="text-md flex items-center justify-center font-bold">
                    {t('cloud:custom_protocol.service.service_input.value')}
                  </div>
                  {isEdit && (
                    <div className="flex cursor-pointer items-center justify-center">
                      <LuPlusCircle
                        onClick={() => {
                          append({ name: '', value: '' })
                        }}
                        className="h-6 w-6"
                      />
                    </div>
                  )}
                </div>
                <div className="box-border w-full">
                  <>
                    {variableListRerender ? (
                      <div className="flex h-full items-center justify-center">
                        <Spinner size="xl" />
                      </div>
                    ) : (
                      fields?.map((item, index) => {
                        return (
                          <div
                            key={index}
                            className={cn(
                              `m-2 grid items-center gap-4 p-4`,
                              isEdit ? 'grid-cols-3' : 'grid-cols-2',
                            )}
                          >
                            <div className="flex items-center justify-center">
                              <div className="h-[36px] w-3/4 rounded-md focus:ring-2 focus:ring-blue-500">
                                <SelectDropdown
                                  name={`input.${index}.name`}
                                  control={control}
                                  options={inputSelectData}
                                  // value={watch(`input.${index}.name`)}
                                  isOptionDisabled={option =>
                                    option.label === t('loading:input') ||
                                    option.label === t('table:no_input')
                                  }
                                  noOptionsMessage={() => t('table:no_input')}
                                  loadingMessage={() => t('loading:input')}
                                  isLoading={
                                    watch('thing_id') && watch('service_name')
                                      ? isLoadingThingService
                                      : false
                                  }
                                  defaultValue={inputSelectData?.find(
                                    item =>
                                      item.value ===
                                      watch(`input.${index}.name`),
                                  )}
                                  value={
                                    watch(`input.${index}.name`) === ''
                                      ? null
                                      : inputSelectData?.find(
                                          item =>
                                            item.value ===
                                            watch(`input.${index}.name`),
                                        )
                                  }
                                  placeholder={''}
                                  error={
                                    formState?.errors?.input?.[index]?.name
                                  }
                                  isDisabled={!isEdit}
                                />
                              </div>
                            </div>
                            <FormField
                              control={form.control}
                              name={`input.${index}.value`}
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-center">
                                  <FormControl>
                                    <div className="flex w-3/4 items-center justify-center">
                                      <Input
                                        className="h-[36px] rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500"
                                        disabled={!isEdit}
                                        value={watch(`input.${index}.value`)}
                                        onChange={e =>
                                          setValue(
                                            `input.${index}.value`,
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            {isEdit && (
                              <div className="flex cursor-pointer items-center justify-center text-red-500 hover:text-red-700">
                                <LuTrash2
                                  onClick={() => remove(index)}
                                  className="h-6 w-6"
                                />
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                    <div className="flex items-center justify-center py-[24px]">
                      {formState.errors.input && (
                        <FormMessage>
                          {formState.errors.input?.root?.message}
                        </FormMessage>
                      )}
                    </div>
                  </>
                </div>
              </>
            </div>
          </div>
          <div className="absolute bottom-6 flex w-full justify-center">
            {isEdit ? (
              <>
                <div className="flex items-center justify-center">
                  <Button type={'submit'} disabled={!isEdit}>
                    {t(
                      'cloud:dashboard.detail_dashboard.add_widget.controller.save',
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center">
                  <Button
                    type={'button'}
                    onClick={() => {
                      handleSendMessage()
                    }}
                  >
                    {t(
                      'cloud:dashboard.detail_dashboard.add_widget.controller.send',
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
