import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '~/components/Button'
import {
  Form,
  InputField,
  SelectDropdown,
  SelectField,
} from '~/components/Form'
import { Drawer } from '~/components/Drawer'
import {
  type UpdateAdapterDTO,
  useUpdateAdapter,
  usePingMQTT,
} from '../api/adapter'
import {
  adapterSchema,
  contentTypeList,
  entityThingSchema,
  outputList,
  protocolList,
  serviceThingSchema,
  thingTypeList,
} from './CreateAdapter'
import storage from '~/utils/storage'
import {
  useCreateEntityThing,
  type CreateEntityThingDTO,
  type GetEntityThingsRes,
} from '../api/entityThing'
import { FormDialog } from '~/components/FormDialog'
import {
  useGetServiceThings,
  useCreateServiceThing,
  type CreateServiceThingDTO,
} from '../api/serviceThing'
import { CodeEditor } from './CodeEditor'
import TitleBar from '~/components/Head/TitleBar'
import { cn } from '~/utils/misc'

import { type AdapterTableContextMenuProps } from './AdapterTable'
import { inputService, type FieldsType } from '../types'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import { PlusIcon } from '~/components/SVGIcons'
import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons'

type UpdateDeviceProps = {
  close: () => void
  isOpen: boolean
  thingData: GetEntityThingsRes
  refetchThingData: any
} & AdapterTableContextMenuProps

export function UpdateAdapter({
  id,
  name,
  protocol,
  content_type,
  thing_id,
  handle_service,
  host,
  port,
  configuration,
  close,
  isOpen,
  thingData,
  refetchThingData,
  schema,
}: UpdateDeviceProps) {
  const { t } = useTranslation()

  const { mutate, isLoading, isSuccess } = useUpdateAdapter()

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  const { id: projectId } = storage.getProject()
  const [thingType, setThingType] = useState('thing')
  const [isShow, setIsShow] = useState(true)

  const {
    mutate: mutateThing,
    isLoading: isLoadingThing,
    isSuccess: isSuccessThing,
  } = useCreateEntityThing()

  const thingSelectData = thingData?.data?.list?.map(thing => ({
    value: thing.id,
    label: thing.name,
  }))
  const thingSelectDataThing = thingData?.data?.list
    ?.filter(thing => thing.type === 'Thing')
    .map(thing => ({
      value: thing.id,
      label: thing.name,
    }))
  const thingSelectDataTemplate = thingData?.data?.list
    ?.filter(thing => thing.type === 'Template')
    .map(thing => ({
      value: thing.id,
      label: thing.name,
    }))

  const {
    mutate: mutateService,
    isLoading: isLoadingService,
    isSuccess: isSuccessService,
  } = useCreateServiceThing()

  const { register, formState, control, handleSubmit, watch, getValues } =
    useForm<UpdateAdapterDTO['data']>({
      resolver: adapterSchema && zodResolver(adapterSchema),
      defaultValues: {
        name,
        thing_id,
        handle_service,
        protocol,
        content_type,
        host,
        port,
        configuration:
          configuration !== 'null' ? JSON.parse(configuration) : null,
        schema: { fields: renderFields() },
      },
    })
  console.log('zod adapter errors: ', formState.errors)

  const { fields, append, remove } = useFieldArray({
    name: 'configuration.topic_filters',
    control,
  })

  const {
    append: appendSchema,
    fields: fieldsSchema,
    remove: removeSchema,
  } = useFieldArray({
    name: 'schema.fields',
    control,
  })

  const { data: serviceData } = useGetServiceThings({
    thingId: getValues('thing_id') || thing_id,
    config: { enabled: !!getValues('thing_id'), suspense: false },
  })
  const serviceSelectData = serviceData?.data?.map(service => ({
    value: service.name,
    label: service.name,
  }))

  const [codeInput, setCodeInput] = useState('')

  const { mutate: mutatePingMQTT, isLoading: isLoadingPingMQTT } = usePingMQTT()

  function renderFields() {
    const schemaParse = typeof schema === 'string' ? JSON.parse(schema) : null
    const result =
      (schemaParse.fields &&
        schemaParse.fields.map((item: FieldsType) => ({
          name: item.name,
          start_byte: item.start_byte,
          length_byte: item.end_byte - item.start_byte,
        }))) ||
      []
    return result
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      title={t('cloud:custom_protocol.adapter.table.edit')}
      renderFooter={() => (
        <>
          <Button
            className="rounded border-none"
            variant="secondary"
            size="lg"
            onClick={close}
            startIcon={
              <img src={btnCancelIcon} alt="cancel" className="h-5 w-5" />
            }
          />
          <Button
            className="rounded border-none"
            form="update-adapter"
            type="submit"
            size="lg"
            isLoading={isLoading}
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
          />
        </>
      )}
    >
      <form
        id="update-adapter"
        className="flex w-full flex-col justify-between"
        onSubmit={handleSubmit(values => {
          // console.log('adapter values', values)
          const fields =
            (values?.schema?.fields?.length &&
              values?.schema?.fields?.map(item => ({
                name: item.name,
                start_byte: parseInt(item.start_byte),
                end_byte:
                  parseInt(item.start_byte) + parseInt(item.length_byte),
              }))) ||
            []
          if (getValues('protocol') === 'mqtt') {
            mutate({
              data: {
                project_id: projectId,
                name: values.name,
                protocol: values.protocol as 'mqtt',
                content_type: values.content_type,
                thing_id: values.thing_id,
                handle_service: values.handle_service,
                host: values.host,
                port: values.port,
                schema:
                  fields.length > 0
                    ? {
                        fields,
                      }
                    : undefined,
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
              },
              id,
            })
          } else {
            mutate({
              data: {
                project_id: projectId,
                name: values.name,
                protocol: values.protocol as 'tcp' | 'udp',
                content_type: values.content_type,
                thing_id: values.thing_id,
                handle_service: values.handle_service,
                schema:
                  fields.length > 0
                    ? {
                        fields,
                      }
                    : undefined,
              },
              id,
            })
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
                  icon={
                    <FormDialog
                      isDone={isSuccessThing}
                      title={t('cloud:custom_protocol.thing.create')}
                      body={
                        <Form<
                          CreateEntityThingDTO['data'],
                          typeof entityThingSchema
                        >
                          id="create-entityThing"
                          className="flex flex-col justify-between"
                          onSubmit={values => {
                            // console.log('thing values', values)
                            if (
                              values.type === 'thing' ||
                              values.type === 'template'
                            ) {
                              mutateThing({
                                data: {
                                  name: values.name,
                                  project_id: projectId,
                                  description: values.description,
                                  type: values.type,
                                  base_template: values.base_template || null,
                                },
                              })
                            }
                            if (values.type === 'shape') {
                              mutateThing({
                                data: {
                                  name: values.name,
                                  project_id: projectId,
                                  description: values.description,
                                  type: values.type as 'shape',
                                  base_shapes: values.base_shapes || null,
                                },
                              })
                            }
                          }}
                          schema={entityThingSchema}
                        >
                          {({ register, formState }) => {
                            return (
                              <>
                                <InputField
                                  label={t('cloud:custom_protocol.thing.name')}
                                  error={formState.errors['name']}
                                  registration={register('name')}
                                />
                                <SelectField
                                  label={t('cloud:custom_protocol.thing.type')}
                                  error={formState.errors['type']}
                                  registration={register('type')}
                                  options={thingTypeList}
                                  onChange={event => {
                                    refetchThingData()
                                    setThingType(event.target.value)
                                  }}
                                />
                                {thingType === 'thing' ||
                                thingType === 'template' ? (
                                  <SelectField
                                    label={t(
                                      'cloud:custom_protocol.thing.base_template',
                                    )}
                                    error={formState.errors['base_template']}
                                    registration={register('base_template')}
                                    options={
                                      thingType === 'thing'
                                        ? thingSelectDataThing
                                        : thingSelectDataTemplate
                                    }
                                  />
                                ) : (
                                  <InputField
                                    label={t(
                                      'cloud:custom_protocol.thing.base_shapes',
                                    )}
                                    error={formState.errors['base_shapes']}
                                    registration={register('base_shapes')}
                                  />
                                )}
                                <InputField
                                  label={t(
                                    'cloud:custom_protocol.thing.description',
                                  )}
                                  error={formState.errors['description']}
                                  registration={register('description')}
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
                          isLoading={isLoadingThing}
                          form="create-entityThing"
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
                          onClick={() => refetchThingData()}
                        />
                      }
                    />
                  }
                  defaultValue={thingSelectData.find(
                    thing => thing.value === getValues('thing_id'),
                  )}
                />
                <p className="text-body-sm text-primary-400">
                  {formState?.errors?.thing_id?.message}
                </p>
              </div>
            </div>
            <div className="flex items-end gap-x-3">
              {serviceSelectData != null ? (
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
                    defaultValue={serviceSelectData.find(
                      service => service.value === getValues('handle_service'),
                    )}
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
                                    onChange={event =>
                                      setThingType(event.target.value)
                                    }
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
              ) : null}
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
    </Drawer>
  )
}
