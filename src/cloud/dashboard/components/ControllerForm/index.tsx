import storage from '@/utils/storage'
import { useEffect, useMemo } from 'react'
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
import { type SendMessage } from 'react-use-websocket/dist/lib/types'
import { LuTrash2, LuPlusCircle } from 'react-icons/lu'
import { cn } from '@/utils/misc'
import { zodResolver } from '@hookform/resolvers/zod'
import { SelectDropdown } from '@/components/Form'
import { useGetEntityThings } from '@/cloud/customProtocol/api/entityThing'
import { useGetServiceThings } from '@/cloud/customProtocol/api/serviceThing'
import { useThingServiceById } from '@/cloud/flowEngineV2/api/thingServiceAPI/getThingServiceById'
import { useTranslation } from 'react-i18next'
import { controllerBtnCreateSchema } from './CreateControllerButton'
import { z } from 'zod'

const configControllerFormSchema = z.object({
  name: z.string(),
  thing_id: z.string(),
  service_name: z.string(),
  input: z
    .array(
      z.object({
        name: z.string(),
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
        message: 'All input names must be unique',
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

  const { register, control, watch, handleSubmit, formState } = form

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
  }))

  // select service list
  const { data: serviceData } = useGetServiceThings({
    thingId: watch('thing_id'),
    config: {
      enabled: !!watch('thing_id'),
    },
  })
  const serviceSelectData = serviceData?.data?.map(service => ({
    value: service.name,
  }))

  // select variable list
  const { data: thingServiceData } = useThingServiceById({
    thingId: watch('thing_id'),
    name: watch('service_name'),
    config: {
      enabled: !!watch('thing_id') && !!watch('service_name'),
    },
  })
  const inputSelectData = thingServiceData?.data?.input?.map(input => ({
    value: input.name,
    type: input.type,
  }))

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
                                  className="w-[90%] rounded-none px-[10px] py-[5px]"
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
                    <FormField
                      control={form.control}
                      name={`thing_id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="grid grid-cols-[1fr_2fr] gap-[10px]">
                              <div className="flex items-center gap-[10px]">
                                {t('cloud:custom_protocol.thing.choose')}
                                <span className="text-primary-400">*</span>
                              </div>
                              <div>
                                <Select
                                  defaultValue={watch(`thing_id`)}
                                  disabled={!isEdit}
                                >
                                  <SelectTrigger className="h-[36px] w-[90%] rounded-md focus:ring-2 focus:ring-blue-500">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      {thingSelectData?.map((item, index) => (
                                        <SelectItem
                                          key={index}
                                          value={item.value}
                                        >
                                          {item.value}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </>
                  <>
                    <FormField
                      control={form.control}
                      name={`service_name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="grid grid-cols-[1fr_2fr] gap-[10px]">
                              <div className="flex items-center gap-[10px]">
                                {t('cloud:custom_protocol.service.title')}
                                <span className="text-primary-400">*</span>
                              </div>
                              <Select
                                defaultValue={watch(`service_name`)}
                                disabled={!isEdit}
                              >
                                <SelectTrigger className="h-[36px] w-[90%] rounded-md focus:ring-2 focus:ring-blue-500">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    {serviceSelectData?.map((item, index) => (
                                      <SelectItem
                                        key={index}
                                        value={item.value}
                                      >
                                        {item.value}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
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
                  <div className="">
                    {watch(`input`)?.map((item, index) => {
                      return (
                        <div
                          key={index}
                          className={cn(
                            `m-2 grid items-center gap-4 p-4`,
                            isEdit ? 'grid-cols-3' : 'grid-cols-2',
                          )}
                        >
                          <FormField
                            control={form.control}
                            name={`input.${index}.name`}
                            render={({ field }) => (
                              <FormItem className="flex justify-center text-black">
                                <FormControl>
                                  <Select
                                    defaultValue={watch(`input.${index}.name`)}
                                    disabled={!isEdit}
                                  >
                                    <SelectTrigger className="h-[36px] w-1/2 rounded-md focus:ring-2 focus:ring-blue-500">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectGroup>
                                        {inputSelectData?.map((item, index) => (
                                          <SelectItem
                                            key={index}
                                            value={item.value}
                                          >
                                            {item.value}
                                          </SelectItem>
                                        ))}
                                      </SelectGroup>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`input.${index}.value`}
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-center">
                                <FormControl>
                                  <div className="flex w-1/2 items-center justify-center">
                                    <Input
                                      {...field}
                                      className="h-[36px] rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500"
                                      disabled={!isEdit}
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
                    })}
                  </div>
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
