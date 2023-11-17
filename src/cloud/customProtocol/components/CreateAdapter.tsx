import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import * as z from 'zod'
import i18n from '~/i18n'

import { Button } from '~/components/Button'
import {
  Form,
  FormDrawer,
  InputField,
  SelectDropdown,
  SelectField,
} from '~/components/Form'
import {
  type CreateAdapterDTO,
  useCreateAdapter,
  usePingMQTT,
} from '../api/adapter'
import storage from '~/utils/storage'
import { useGetEntityThings } from '../api/entityThing'
import { FormDialog } from '~/components/FormDialog'
import {
  type CreateServiceThingDTO,
  useGetServiceThings,
  useCreateServiceThing,
} from '../api/serviceThing'
import { CodeEditor } from './CodeEditor'
import TitleBar from '~/components/Head/TitleBar'
import { cn } from '~/utils/misc'
import { CreateThing } from '~/cloud/flowEngineV2/components/Attributes'

import { nameSchema, nameSchemaRegex } from '~/utils/schemaValidation'
import { inputService } from '../types'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons'

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
]

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
]

export const outputList = [
  {
    label: i18n.t('cloud:custom_protocol.service.json'),
    value: 'json',
  },
  {
    label: i18n.t('cloud:custom_protocol.service.str'),
    value: 'str',
  },
  {
    label: i18n.t('cloud:custom_protocol.service.i32'),
    value: 'i32',
  },
  {
    label: i18n.t('cloud:custom_protocol.service.i64'),
    value: 'i64',
  },
  {
    label: i18n.t('cloud:custom_protocol.service.f32'),
    value: 'f32',
  },
  {
    label: i18n.t('cloud:custom_protocol.service.f64'),
    value: 'f64',
  },
  {
    label: i18n.t('cloud:custom_protocol.service.bool'),
    value: 'bool',
  },
]

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
]

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
        protocol: z.enum(['tcp', 'udp'] as const),
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

export const entityThingSchema = z
  .object({
    name: nameSchema,
    project_id: z.string().optional(),
    description: z.string(),
  })
  .and(
    z.discriminatedUnion('type', [
      z.object({
        type: z.literal('thing'),
        base_template: z.string().optional(),
      }),
      z.object({
        type: z.literal('template'),
        base_shapes: z.string(),
      }),
      z.object({
        type: z.literal('shape'),
      }),
    ]),
  )

export const serviceThingSchema = z.object({
  name: nameSchemaRegex,
  description: z.string(),
  input: z.array(z.object({ name: z.string(), type: z.string() })).optional(),
  output: z.enum([
    'json',
    'str',
    'i32',
    'i64',
    'f32',
    'f64',
    'bool',
    'time',
    'bin',
  ] as const),
  code: z.string().optional(),
})

export function CreateAdapter() {
  const { t } = useTranslation()

  const { id: projectId } = storage.getProject()

  const [isShow, setIsShow] = useState(true)

  const {
    mutate: mutateAdapter,
    isLoading: isLoadingAdapter,
    isSuccess: isSuccessAdapter,
  } = useCreateAdapter()

  const { data: thingData } = useGetEntityThings({
    projectId,
  })
  const thingSelectData = thingData?.data?.list?.map(thing => ({
    value: thing.id,
    label: thing.name,
  }))

  const {
    mutate: mutateService,
    isLoading: isLoadingService,
    isSuccess: isSuccessService,
  } = useCreateServiceThing()

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
  console.log('zod adapter errors: ', formState.errors)

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

  const { data: serviceData } = useGetServiceThings({
    thingId: getValues('thing_id'),
    config: {
      enabled: !!getValues('thing_id'),
      suspense: false,
    },
  })

  const serviceSelectData = serviceData?.data?.map(service => ({
    value: service.name,
    label: service.name,
  }))

  const [codeInput, setCodeInput] = useState('')

  const { mutate: mutatePingMQTT, isLoading: isLoadingPingMQTT } = usePingMQTT()

  const resetData = () => {
    reset()
    replace({ topic: '' })
    replaceSchema({
      name: '',
      start_byte: 0,
      length_byte: 0,
    })
  }

  return (
    <FormDrawer
      isDone={isSuccessAdapter}
      triggerButton={
        <Button
          className="rounded-md"
          variant="trans"
          size="square"
          startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
      }
      title={t('cloud:custom_protocol.adapter.create')}
      submitButton={
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
      }
      resetData={resetData}
    >
      <form
        id="create-adapter"
        className="flex w-full flex-col justify-between"
        onSubmit={handleSubmit(values => {
          // console.log('adapter values', values)
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
            <div className="flex items-end gap-x-3">
              <div className="w-full space-y-1">
                <SelectDropdown
                  isClearable
                  label={t('cloud:custom_protocol.thing.id')}
                  name="thing_id"
                  control={control}
                  options={
                    thingData
                      ? thingSelectData
                      : [
                          {
                            label: t('loading:entity_thing'),
                            value: '',
                          },
                        ]
                  }
                  isOptionDisabled={option =>
                    option.label === t('loading:entity_thing')
                  }
                  noOptionsMessage={() => t('table:no_thing')}
                  placeholder={t('cloud:custom_protocol.thing.choose')}
                  icon={<CreateThing thingType="thing" />}
                  // defaultValue={defaultThingValues}
                />
                <p className="text-body-sm text-primary-400">
                  {formState?.errors?.thing_id?.message}
                </p>
              </div>
            </div>
            <div className="flex items-end gap-x-3">
              <div className="w-full space-y-1">
                <SelectDropdown
                  isClearable
                  label={t('cloud:custom_protocol.service.title')}
                  name="handle_service"
                  control={control}
                  options={
                    serviceData?.data != null
                      ? serviceSelectData
                      : serviceData?.data == null
                      ? [
                          {
                            label: t('table:no_service'),
                            value: '',
                          },
                        ]
                      : [
                          {
                            label: t('loading:service_thing'),
                            value: '',
                          },
                        ]
                  }
                  isOptionDisabled={option =>
                    option.label === t('loading:service_thing') ||
                    option.label === t('table:no_service')
                  }
                  noOptionsMessage={() => t('table:no_service')}
                  placeholder={t('cloud:custom_protocol.service.choose')}
                  icon={
                    <FormDialog
                      isDone={isSuccessService}
                      title={t('cloud:custom_protocol.service.create')}
                      body={
                        <Form<
                          CreateServiceThingDTO['data'],
                          typeof serviceThingSchema
                        >
                          id="create-serviceThing"
                          className="flex flex-col justify-between"
                          onSubmit={values => {
                            // console.log('service values', values)
                            mutateService({
                              data: {
                                name: values.name,
                                description: values.description,
                                output: values.output,
                                input: inputService,
                                code: codeInput,
                              },
                              thingId: getValues('thing_id'),
                            })
                          }}
                          schema={serviceThingSchema}
                        >
                          {({ register, formState }) => {
                            // console.log(
                            //   'zod service errors: ',
                            //   formState.errors,
                            // )
                            return (
                              <>
                                <InputField
                                  label={t(
                                    'cloud:custom_protocol.service.name',
                                  )}
                                  error={formState.errors['name']}
                                  registration={register('name')}
                                />
                                <SelectField
                                  label={t(
                                    'cloud:custom_protocol.service.output',
                                  )}
                                  error={formState.errors['output']}
                                  registration={register('output')}
                                  options={outputList}
                                />
                                <InputField
                                  label={t(
                                    'cloud:custom_protocol.service.description',
                                  )}
                                  error={formState.errors['description']}
                                  registration={register('description')}
                                />
                                <CodeEditor
                                  label={t(
                                    'cloud:custom_protocol.service.code',
                                  )}
                                  setCodeInput={setCodeInput}
                                />
                              </>
                            )
                          }}
                        </Form>
                      }
                      triggerButton={
                        <Button
                          variant="trans"
                          className="rounded-md"
                          size="square"
                          disabled={!watch('thing_id')}
                          startIcon={
                            <PlusIcon
                              width={16}
                              height={16}
                              viewBox="0 0 16 16"
                            />
                          }
                        />
                      }
                      confirmButton={
                        <Button
                          isLoading={isLoadingService}
                          form="create-serviceThing"
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
                        />
                      }
                    />
                  }
                />
                <p className="text-body-sm text-primary-400">
                  {formState?.errors?.handle_service?.message}
                </p>
              </div>
            </div>
            <SelectField
              label={t('cloud:custom_protocol.protocol')}
              error={formState.errors['protocol']}
              registration={register('protocol')}
              options={protocolList}
            />
            <SelectField
              label={t('cloud:custom_protocol.adapter.content_type.title')}
              error={formState.errors['content_type']}
              registration={register('content_type')}
              options={contentTypeList}
            />
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
                      <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5" />
                    )}
                  </div>
                  <Button
                    className="rounded-md"
                    variant="trans"
                    size="square"
                    startIcon={
                      <PlusIcon width={16} height={16} viewBox="0 0 16 16" />
                    }
                    onClick={() => {
                      setIsShow(true)
                      appendSchema({
                        name: '',
                        start_byte: 0,
                        length_byte: 0,
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
                        label={t('cloud:custom_protocol.adapter.schema.name')}
                        error={formState.errors?.schema?.fields?.[index]?.name}
                        registration={register(
                          `schema.fields.${index}.name` as const,
                        )}
                      />
                      <InputField
                        label={t(
                          'cloud:custom_protocol.adapter.schema.start_byte',
                        )}
                        error={
                          formState.errors?.schema?.fields?.[index]?.start_byte
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
                          formState.errors?.schema?.fields?.[index]?.length_byte
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
                  error={formState.errors?.configuration?.credentials?.username}
                  registration={register('configuration.credentials.username')}
                />
                <InputField
                  label={t('cloud:custom_protocol.adapter.pass')}
                  error={formState.errors?.configuration?.credentials?.password}
                  registration={register('configuration.credentials.password')}
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
                      <PlusIcon width={16} height={16} viewBox="0 0 16 16" />
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
                        formState.errors?.configuration?.topic_filters?.[index]
                          ?.topic
                      }
                      registration={register(
                        `configuration.topic_filters.${index}.topic` as const,
                      )}
                      classnamefieldwrapper="flex items-center gap-x-3"
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
    </FormDrawer>
  )
}
