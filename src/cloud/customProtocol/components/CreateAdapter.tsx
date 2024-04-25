import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useRef, useState } from 'react'
import * as z from 'zod'
import i18n from '@/i18n'
import { type SelectInstance } from 'react-select'

import { Button } from '@/components/Button'
import {
  InputField,
  SelectDropdown,
  SelectField,
  type SelectOption,
} from '@/components/Form'
import {
  type CreateAdapterDTO,
  useCreateAdapter,
  usePingMQTT,
} from '../api/adapter'
import storage from '@/utils/storage'
import { useGetEntityThings } from '../api/entityThing'
import { useGetServiceThings } from '../api/serviceThing'
import TitleBar from '@/components/Head/TitleBar'
import { cn } from '@/utils/misc'
import { CreateThing } from '@/cloud/flowEngineV2/components/Attributes'
import { CreateService } from './CreateService'

import { nameSchema, nameSchemaRegex } from '@/utils/schemaValidation'

import { PlusIcon } from '@/components/SVGIcons'
import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import { LuChevronDown, LuChevronRight } from 'react-icons/lu'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export const protocolList = [
  {
    label: i18n.t('cloud:custom_protocol.adapter.protocol.mqtt'),
    value: 'mqtt',
  },
  {
    label: i18n.t('cloud:custom_protocol.adapter.protocol.tcp'),
    value: 'tcp',
  },
  {
    label: i18n.t('cloud:custom_protocol.adapter.protocol.udp'),
    value: 'udp',
  },
  {
    label: i18n.t('cloud:custom_protocol.adapter.protocol.ftp'),
    value: 'ftp',
  },
] as const

export const contentTypeList = [
  {
    label: i18n.t('cloud:custom_protocol.adapter.content_type.json'),
    value: 'json',
  },
  {
    label: i18n.t('cloud:custom_protocol.adapter.content_type.hex'),
    value: 'hex',
  },
  {
    label: i18n.t('cloud:custom_protocol.adapter.content_type.text'),
    value: 'text',
  },
] as const

export const contentTypeFTPList = [
  {
    label: i18n.t('cloud:custom_protocol.adapter.content_type.text'),
    value: 'text',
  },
] as const

export const thingTypeList = [
  {
    label: i18n.t('cloud:custom_protocol.thing.thing'),
    value: 'thing',
  },
  {
    label: i18n.t('cloud:custom_protocol.thing.template'),
    value: 'template',
  },
  {
    label: i18n.t('cloud:custom_protocol.thing.shape'),
    value: 'shape',
  },
] as const

export const adapterSchema = z
  .object({
    name: nameSchema,
    project_id: z.string().optional(),
    thing_id: z.string(),
    handle_service: z.string(),
  })
  .and(
    z.discriminatedUnion('protocol', [
      z.object({
        protocol: z.literal('mqtt'),
        host: z.string().min(1, { message: 'Vui lòng nhập host' }),
        port: z.string().min(1, { message: 'Vui lòng nhập port' }),
        configuration: z.object({
          credentials: z.object({
            username: z.string(),
            password: z.string(),
          }),
          topic_filters: z.array(
            z.object({
              topic: z.string().min(1, { message: 'Vui lòng nhập topic' }),
            }),
          ),
        }),
      }),
      z.object({
        protocol: z.enum(['tcp', 'udp', 'ftp'] as const),
      }),
    ]),
  )
  .and(
    z.discriminatedUnion('content_type', [
      z.object({
        content_type: z.literal('json'),
      }),
      z.object({
        content_type: z.enum(['hex', 'text'] as const),
        schema: z.object({
          fields: z.array(
            z.object({
              name: nameSchema,
              start_byte: z.number(),
              length_byte: z
                .number()
                .min(1, {
                  message: i18n.t(
                    'cloud:custom_protocol.adapter.schema.length_byte_validate',
                  ),
                })
                .optional(),
            }),
          ),
        }),
      }),
    ]),
  )

export const serviceThingSchema = z.object({
  name: nameSchemaRegex,
  description: z.string(),
  input: z.array(z.object({ name: z.string(), type: z.string() })).optional(),
  output: z.enum(['json', 'str', 'i32', 'i64', 'f32', 'f64', 'bool'] as const),
  code: z.string().optional(),
})

type CreateAdapterProps = {
  open?: () => void
  close?: () => void
  isOpen?: boolean
}

export function CreateAdapter({ open, close, isOpen }: CreateAdapterProps) {
  const { t } = useTranslation()

  const projectId = storage.getProject()?.id

  const [isShow, setIsShow] = useState(true)

  const {
    mutate: mutateAdapter,
    isLoading: isLoadingAdapter,
    isSuccess: isSuccessAdapter,
  } = useCreateAdapter()

  const { data: thingData, isLoading: AdapterIsLoading } = useGetEntityThings({
    projectId,
    type: 'thing',
  })
  const thingSelectData = thingData?.data?.list?.map(thing => ({
    value: thing.id,
    label: thing.name,
  }))

  const {
    register,
    formState,
    control,
    handleSubmit,
    watch,
    getValues,
    reset,
  } = useForm<CreateAdapterDTO['data']>({
    resolver: adapterSchema && zodResolver(adapterSchema),
  })

  const { fields, append, remove, replace } = useFieldArray({
    name: 'configuration.topic_filters',
    control,
  })

  const {
    append: appendSchema,
    fields: fieldsSchema,
    remove: removeSchema,
    replace: replaceSchema,
  } = useFieldArray({
    name: 'schema.fields',
    control,
  })

  const { data: serviceData, isLoading: isLoadingService } =
    useGetServiceThings({
      thingId: getValues('thing_id'),
      config: {
        enabled: !!getValues('thing_id'),
      },
    })

  const serviceSelectData = serviceData?.data?.map(service => ({
    value: service.name,
    label: service.name,
  }))

  const { mutate: mutatePingMQTT, isLoading: isLoadingPingMQTT } = usePingMQTT()

  const resetData = () => {
    reset()
    replace({ topic: '' })
    replaceSchema({
      name: '',
      start_byte: 0,
      length_byte: 1,
    })
  }

  const selectDropdownServiceRef = useRef<SelectInstance<SelectOption> | null>(
    null,
  )

  return (
    <Sheet open={isOpen} onOpenChange={close} modal={false}>
      <SheetContent
        onInteractOutside={e => {
          e.preventDefault()
        }}
        className={cn('flex h-full max-w-xl flex-col justify-between')}
      >
        <SheetHeader>
          <SheetTitle>{t('cloud:custom_protocol.adapter.create')}</SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
          <form
            id="create-adapter"
            className="flex w-full flex-col justify-between"
            onSubmit={handleSubmit(values => {
              if (values.protocol === 'mqtt') {
                const data = {
                  project_id: projectId,
                  name: values.name,
                  protocol: values.protocol,
                  content_type: values.content_type,
                  thing_id: values.thing_id,
                  handle_service: values.handle_service,
                  host: values.host,
                  port: values.port,
                  configuration: {
                    credentials: {
                      username: values.configuration.credentials.username,
                      password: values.configuration.credentials.password,
                    },
                    topic_filters: values.configuration.topic_filters.map(
                      (topic: { topic: string }) => ({
                        topic: topic.topic.trim(),
                      }),
                    ),
                  },
                }
                if (values.content_type === 'json') {
                  mutateAdapter({ data })
                }
                if (
                  values.content_type === 'hex' ||
                  values.content_type === 'text'
                ) {
                  mutateAdapter({
                    data: {
                      ...data,
                      schema: {
                        fields: values.schema.fields.map(item => ({
                          name: item.name,
                          start_byte: item.start_byte,
                          end_byte:
                            item.start_byte +
                            (item.length_byte as unknown as number),
                        })),
                      },
                    },
                  })
                }
              } else {
                const data = {
                  project_id: projectId,
                  name: values.name,
                  protocol: values.protocol,
                  content_type: values.content_type,
                  thing_id: values.thing_id,
                  handle_service: values.handle_service,
                }
                if (values.content_type === 'json') {
                  mutateAdapter({ data })
                }
                if (
                  values.content_type === 'hex' ||
                  values.content_type === 'text'
                ) {
                  mutateAdapter({
                    data: {
                      ...data,
                      schema: {
                        fields: values.schema.fields.map(item => ({
                          name: item.name,
                          start_byte: item.start_byte,
                          end_byte:
                            item.start_byte +
                            (item.length_byte as unknown as number),
                        })),
                      },
                    },
                  })
                }
              }
            })}
          >
            <div className="flex w-full grow flex-col">
              <div className="flex grow flex-col gap-y-5">
                <InputField
                  label={t('cloud:custom_protocol.adapter.name')}
                  error={formState.errors['name']}
                  registration={register('name')}
                />
                <div className="relative w-full">
                  <div className="w-[calc(100%-2.5rem)]">
                    <SelectDropdown
                      label={t('cloud:custom_protocol.thing.id')}
                      name="thing_id"
                      control={control}
                      options={thingSelectData}
                      isOptionDisabled={option =>
                        option.label === t('loading:entity_thing') ||
                        option.label === t('table:no_thing')
                      }
                      noOptionsMessage={() => t('table:no_thing')}
                      loadingMessage={() => t('loading:entity_thing')}
                      isLoading={AdapterIsLoading}
                      placeholder={t('cloud:custom_protocol.thing.choose')}
                      handleClearSelectDropdown={() =>
                        selectDropdownServiceRef.current?.clearValue()
                      }
                      handleChangeSelect={() =>
                        selectDropdownServiceRef.current?.clearValue()
                      }
                      error={formState?.errors?.thing_id}
                    />
                  </div>
                  <CreateThing
                    thingType="thing"
                    classNameTriggerBtn="h-[38px] absolute right-0 bottom-0"
                  />
                </div>
                <div className="relative w-full">
                  <div className="w-[calc(100%-2.5rem)]">
                    <SelectDropdown
                      refSelect={selectDropdownServiceRef}
                      label={t('cloud:custom_protocol.service.title')}
                      name="handle_service"
                      control={control}
                      options={serviceSelectData}
                      isOptionDisabled={option =>
                        option.label === t('loading:service_thing') ||
                        option.label === t('table:no_service')
                      }
                      isLoading={
                        watch('thing_id') != null ? isLoadingService : false
                      }
                      loadingMessage={() => t('loading:service_thing')}
                      noOptionsMessage={() => t('table:no_service')}
                      placeholder={t('cloud:custom_protocol.service.choose')}
                      error={formState?.errors?.handle_service}
                    />
                  </div>
                  <CreateService
                    thingId={watch('thing_id')}
                    classNameTriggerBtn="h-[38px] absolute right-0 bottom-0"
                  />
                </div>
                <SelectField
                  label={t('cloud:custom_protocol.protocol')}
                  error={formState.errors['protocol']}
                  registration={register('protocol')}
                  options={protocolList}
                />
                {watch('protocol') === 'ftp' ? (
                  <SelectField
                    label={t(
                      'cloud:custom_protocol.adapter.content_type.title',
                    )}
                    error={formState.errors['content_type']}
                    registration={register('content_type')}
                    options={contentTypeFTPList}
                  />
                ) : (
                  <SelectField
                    label={t(
                      'cloud:custom_protocol.adapter.content_type.title',
                    )}
                    error={formState.errors['content_type']}
                    registration={register('content_type')}
                    options={contentTypeList}
                  />
                )}
                {watch('content_type') != null &&
                watch('content_type') !== '' &&
                watch('content_type') !== 'json' ? (
                  <div className="space-y-6">
                    <div className="flex justify-between space-x-3">
                      <TitleBar
                        title={t('cloud:custom_protocol.adapter.new_template')}
                        className="w-full rounded-md bg-gray-500 pl-3"
                      />
                      <div
                        className="flex cursor-pointer items-center"
                        onClick={() => setIsShow(!isShow)}
                      >
                        {isShow ? (
                          <LuChevronDown className="h-5 w-5" />
                        ) : (
                          <LuChevronRight className="h-5 w-5" />
                        )}
                      </div>
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
                        onClick={() => {
                          setIsShow(true)
                          appendSchema({
                            name: '',
                            start_byte: 0,
                            length_byte: 1,
                          })
                        }}
                      />
                    </div>
                    {fieldsSchema.map((field, index) => (
                      <section
                        className={cn(
                          'mt-3 flex justify-between rounded-md bg-slate-200 px-2 py-4',
                          {
                            hidden: !isShow,
                          },
                        )}
                        key={field.id}
                      >
                        <div className="grid w-full grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-3">
                          <InputField
                            label={t(
                              'cloud:custom_protocol.adapter.schema.name',
                            )}
                            error={
                              formState.errors?.schema?.fields?.[index]?.name
                            }
                            registration={register(
                              `schema.fields.${index}.name` as const,
                            )}
                          />
                          <InputField
                            label={t(
                              'cloud:custom_protocol.adapter.schema.start_byte',
                            )}
                            error={
                              formState.errors?.schema?.fields?.[index]
                                ?.start_byte
                            }
                            type="number"
                            registration={register(
                              `schema.fields.${index}.start_byte` as const,
                              {
                                valueAsNumber: true,
                              },
                            )}
                          />
                          <InputField
                            label={t(
                              'cloud:custom_protocol.adapter.schema.length_byte',
                            )}
                            error={
                              formState.errors?.schema?.fields?.[index]
                                ?.length_byte
                            }
                            type="number"
                            registration={register(
                              `schema.fields.${index}.length_byte` as const,
                              {
                                valueAsNumber: true,
                              },
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          size="square"
                          variant="none"
                          className="mt-3 self-start !pr-0"
                          onClick={() => removeSchema(index)}
                          startIcon={
                            <img
                              src={btnDeleteIcon}
                              alt="Delete schema"
                              className="h-9 w-9"
                            />
                          }
                        />
                      </section>
                    ))}
                  </div>
                ) : null}
                {watch('protocol') != null && watch('protocol') === 'mqtt' ? (
                  <div className="space-y-6">
                    <InputField
                      label={t('cloud:custom_protocol.adapter.host')}
                      error={formState.errors['host']}
                      registration={register('host')}
                    />
                    <InputField
                      label={t('cloud:custom_protocol.adapter.port')}
                      error={formState.errors['port']}
                      registration={register('port')}
                    />
                    <InputField
                      label={t('cloud:custom_protocol.adapter.username')}
                      error={
                        formState.errors?.configuration?.credentials?.username
                      }
                      registration={register(
                        'configuration.credentials.username',
                      )}
                    />
                    <InputField
                      label={t('cloud:custom_protocol.adapter.pass')}
                      error={
                        formState.errors?.configuration?.credentials?.password
                      }
                      registration={register(
                        'configuration.credentials.password',
                      )}
                    />
                    <div className="flex justify-between space-x-3">
                      <TitleBar
                        title={t('cloud:custom_protocol.adapter.topic_list')}
                        className="w-full rounded-md bg-secondary-700 pl-3"
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
                        onClick={() => append({ topic: '' })}
                      />
                    </div>
                    {fields.map((field, index) => (
                      <section
                        className="mt-3 flex justify-between gap-x-2"
                        key={field.id}
                      >
                        <InputField
                          label={`${t('cloud:custom_protocol.adapter.topic')} ${
                            index + 1
                          }`}
                          error={
                            formState.errors?.configuration?.topic_filters?.[
                              index
                            ]?.topic
                          }
                          registration={register(
                            `configuration.topic_filters.${index}.topic` as const,
                          )}
                          classnamefieldwrapper="flex items-center gap-x-3 mr-[42px]"
                        />
                        <Button
                          type="button"
                          size="square"
                          variant="none"
                          className="mt-0 self-start p-0"
                          onClick={() => remove(index)}
                          startIcon={
                            <img
                              src={btnDeleteIcon}
                              alt="Delete topic"
                              className="h-10 w-10"
                            />
                          }
                        />
                      </section>
                    ))}
                    <div className="flex justify-end">
                      <Button
                        className="rounded-sm border-none"
                        variant="secondary"
                        size="square"
                        onClick={() =>
                          mutatePingMQTT({
                            data: {
                              host: getValues('host'),
                              port: getValues('port'),
                              username: getValues(
                                'configuration.credentials.username',
                              ),
                              password: getValues(
                                'configuration.credentials.password',
                              ),
                            },
                          })
                        }
                        isLoading={isLoadingPingMQTT}
                      >
                        {t('cloud:custom_protocol.adapter.ping_MQTT.title')}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </form>
        </div>

        <SheetFooter>
          <>
            <Button
              className="rounded border-none"
              variant="secondary"
              size="lg"
              onClick={close}
              startIcon={
                <img src={btnCancelIcon} alt="Submit" className="h-5 w-5" />
              }
            />
            <Button
              className="rounded border-none"
              form="create-adapter"
              type="submit"
              size="lg"
              isLoading={isLoadingAdapter}
              startIcon={
                <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
              }
            />
          </>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
