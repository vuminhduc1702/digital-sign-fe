import { useTranslation } from 'react-i18next'
import { Tab } from '@headlessui/react'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'

import { Button } from '~/components/Button'
import {
  Form,
  FormMultipleFields,
  InputField,
  SelectDropdown,
  SelectField,
  type SelectOption,
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
import { queryClient } from '~/lib/react-query'
import {
  useGetServiceThings,
  useCreateServiceThing,
  type CreateServiceThingDTO,
} from '../api/serviceThing'
import { CodeEditor } from './CodeEditor'
import TitleBar from '~/components/Head/TitleBar'

import { type AdapterTableContextMenuProps } from './AdapterTable'
import { inputService, type EntityThingList, type FieldsType } from '../types'
import { type BasePagination } from '~/types'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import { PlusIcon } from '~/components/SVGIcons'
import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { cn } from '~/utils/misc'

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

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [protocolType, setProtocolType] = useState(protocol)
  const [thingType, setThingType] = useState('thing')
  const [selectedThingId, setSelectedThingId] = useState(thing_id)
  const [optionThingService, setOptionService] = useState<SelectOption>({
    label: handle_service,
    value: handle_service,
  })
  const [contentType, setContentType] = useState(content_type)
  const [isShow, setIsShow] = useState(true)

  const {
    mutate: mutateThing,
    isLoading: isLoadingThing,
    isSuccess: isSuccessThing,
  } = useCreateEntityThing()

  const thingListCache:
    | ({ data: EntityThingList } & BasePagination)
    | undefined = queryClient.getQueryData(['entity-things'], { exact: false })
  const thingSelectData = thingData?.data?.list?.map(thing => ({
    value: thing.id,
    label: thing.name,
  })) || [{ value: '', label: '' }]

  const {
    mutate: mutateService,
    isLoading: isLoadingService,
    isSuccess: isSuccessService,
  } = useCreateServiceThing()

  const [optionThingId, setOptionThingId] = useState<SelectOption>({
    label: '',
    value: '',
  })

  const { data: serviceData } = useGetServiceThings({
    thingId: selectedThingId ? selectedThingId : thing_id,
    config: { enabled: !!selectedThingId, suspense: false },
  })
  useEffect(() => {
    const thingFilter =
      thingSelectData.length &&
      thingSelectData.filter(item => item.value === thing_id)
    setOptionThingId(thingFilter[0] || [{ value: '', label: '' }])
  }, [])
  const serviceSelectData = serviceData?.data?.map(service => ({
    value: service.name,
    label: service.name,
  })) || [{ value: '', label: '' }]

  const [codeInput, setCodeInput] = useState('')

  const { mutate: mutatePingMQTT, isLoading: isLoadingPingMQTT } = usePingMQTT()

  // const [isCreateAdapterFormUpdated, setIsCreateAdapterFormUpdated] =
  //   useState(false)
  const protocolTypeRef = useRef(protocol)

  const renderFields = () => {
    const schemaParse = typeof schema === 'string' ? JSON.parse(schema) : null
    const result =
      (schemaParse.fields &&
        schemaParse.fields.map((item: FieldsType) => ({
          name: item.name,
          start_byte: item.start_byte.toString() || '',
          length_byte: (item.end_byte - item.start_byte).toString() || '',
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
            // disabled={
            //   !isCreateAdapterFormUpdated &&
            //   protocolTypeRef.current === protocolType
            // }
          />
        </>
      )}
    >
      <FormMultipleFields<UpdateAdapterDTO['data'], typeof adapterSchema>
        id="update-adapter"
        className="flex flex-col justify-between"
        onSubmit={values => {
          // console.log('adapter values', values)
          const fields =
            values?.fields?.length &&
            values?.fields?.map(item => ({
              name: item?.name,
              start_byte: parseInt(item?.start_byte),
              end_byte:
                parseInt(item?.start_byte) + parseInt(item?.length_byte),
            }))

          if (protocolType === 'mqtt') {
            if (fields.length > 0) {
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
                  schema: {
                    fields,
                  },
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
                  protocol: values.protocol as 'mqtt',
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
                },
                id,
              })
            }
          } else {
            if (fields.length > 0) {
              mutate({
                data: {
                  project_id: projectId,
                  name: values.name,
                  protocol: values.protocol as 'tcp' | 'udp',
                  content_type: values.content_type,
                  thing_id: values.thing_id,
                  handle_service: values.handle_service,
                  schema: {
                    fields,
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
                  handle_service: values.handle_service
                },
                id,
              })
            }
          }
        }}
        schema={adapterSchema}
        name={['configuration.topic_filters', 'fields']}
        options={{
          defaultValues: {
            name,
            content_type,
            handle_service,
            host,
            port,
            protocol,
            thing_id,
            configuration:
              configuration !== 'null' ? JSON.parse(configuration) : null,
            fields: renderFields(),
          },
        }}
      >
        {(
          { register, formState, control, watch, setValue },
          { fields, append, remove },
          { append: appendSchema, fields: fieldsSchema, remove: removeSchema },
        ) => {
          console.log('zod adapter errors: ', formState.errors)
          // setIsCreateAdapterFormUpdated(formState.isDirty)

          return (
            <>
              <Tab.Group
                selectedIndex={selectedIndex}
                onChange={setSelectedIndex}
              >
                <div className="flex w-full grow flex-col">
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
                    <Tab
                      className={({ selected }) =>
                        clsx(
                          'py-2.5 text-body-sm hover:text-primary-400 focus:outline-none',
                          { 'text-primary-400': selected },
                        )
                      }
                    >
                      <div className="flex items-center gap-x-2">
                        <p>{t('cloud:custom_protocol.service.title')}</p>
                      </div>
                    </Tab>
                  </Tab.List>
                  <Tab.Panels className="mt-2 flex grow flex-col">
                    <Tab.Panel
                      className={clsx(
                        'flex grow flex-col bg-white focus:outline-none',
                      )}
                    >
                      <div className="flex grow flex-col gap-y-6 px-9 py-3 shadow-lg">
                        <InputField
                          label={t('cloud:custom_protocol.adapter.name')}
                          error={formState.errors['name']}
                          registration={register('name')}
                        />
                        <SelectField
                          label={t('cloud:custom_protocol.protocol')}
                          error={formState.errors['protocol']}
                          registration={register('protocol')}
                          options={protocolList}
                          onChange={event => {
                            setProtocolType(
                              String(event.target.value).toLowerCase(),
                            )
                            protocolTypeRef.current = protocolType
                          }}
                        />
                        <SelectField
                          label={t(
                            'cloud:custom_protocol.adapter.content_type.title',
                          )}
                          error={formState.errors['content_type']}
                          registration={register('content_type')}
                          options={contentTypeList}
                          onChange={event =>
                            setContentType(
                              String(event.target.value).toLowerCase(),
                            )
                          }
                        />
                        {contentType !== 'json' ? (
                          <div className="space-y-6">
                            <div className="flex justify-between space-x-3">
                              <TitleBar
                                title={t(
                                  'cloud:custom_protocol.adapter.new_template',
                                )}
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
                                  <PlusIcon
                                    width={16}
                                    height={16}
                                    viewBox="0 0 16 16"
                                  />
                                }
                                onClick={() =>
                                  appendSchema({
                                    name: '',
                                    start_byte: '',
                                    length_byte: '',
                                  })
                                }
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
                                      formState.errors?.fields?.[index]?.name
                                    }
                                    registration={register(
                                      `fields.${index}.name` as const,
                                    )}
                                  />
                                  <InputField
                                    label={t(
                                      'cloud:custom_protocol.adapter.schema.start_byte',
                                    )}
                                    error={
                                      formState.errors?.fields?.[index]
                                        ?.start_byte
                                    }
                                    type="number"
                                    registration={register(
                                      `fields.${index}.start_byte` as const,
                                    )}
                                  />
                                  <InputField
                                    label={t(
                                      'cloud:custom_protocol.adapter.schema.length_byte',
                                    )}
                                    error={
                                      formState.errors?.fields?.[index]
                                        ?.length_byte
                                    }
                                    type="number"
                                    registration={register(
                                      `fields.${index}.length_byte` as const,
                                    )}
                                    min="1"
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
                        {protocolType === 'mqtt' ? (
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
                              label={t(
                                'cloud:custom_protocol.adapter.username',
                              )}
                              error={
                                formState.errors?.configuration?.credentials
                                  ?.username
                              }
                              registration={register(
                                'configuration.credentials.username',
                              )}
                            />
                            <InputField
                              label={t('cloud:custom_protocol.adapter.pass')}
                              error={
                                formState.errors?.configuration?.credentials
                                  ?.password
                              }
                              registration={register(
                                'configuration.credentials.password',
                              )}
                            />
                            <div className="flex justify-between space-x-3">
                              <TitleBar
                                title={t(
                                  'cloud:custom_protocol.adapter.topic_list',
                                )}
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
                                  label={`${t(
                                    'cloud:custom_protocol.adapter.topic',
                                  )} ${index + 1}`}
                                  error={
                                    formState.errors?.configuration
                                      ?.topic_filters?.[index]?.topic
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
                                      host: watch('host'),
                                      port: watch('port'),
                                      username: watch(
                                        'configuration.credentials.username',
                                      ),
                                      password: watch(
                                        'configuration.credentials.password',
                                      ),
                                    },
                                  })
                                }
                                isLoading={isLoadingPingMQTT}
                              >
                                {t(
                                  'cloud:custom_protocol.adapter.ping_MQTT.title',
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </Tab.Panel>
                    <Tab.Panel
                      className={clsx(
                        'flex grow flex-col bg-white focus:outline-none',
                      )}
                    >
                      <div className="flex grow flex-col px-9 py-3 shadow-lg">
                        <div className="space-y-1">
                          <SelectDropdown
                            isClearable={true}
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
                            onMenuOpen={() => {
                              if (thingListCache?.data.list) {
                                return
                              } else refetchThingData()
                            }}
                            // onMenuClose={() => {
                            //   const selectedThingWatch = watch(
                            //     'thing_id',
                            //   ) as unknown as SelectOption
                            //   setSelectedThing(selectedThingWatch)
                            // }}
                            onChange={e => {
                              setSelectedThingId(e?.value)
                              setOptionThingId(e)
                              setValue('thing_id', e?.value)
                            }}
                            value={optionThingId}
                            placeholder={t(
                              'cloud:custom_protocol.thing.choose',
                            )}
                            // defaultValue={defaultThingValues}
                          />
                          <p className="text-body-sm text-primary-400">
                            {formState?.errors?.thing_id?.message}
                          </p>
                        </div>
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
                                      base_template:
                                        values.base_template || null,
                                    },
                                  })
                                }
                                if (values.type === 'shape') {
                                  mutateThing({
                                    data: {
                                      name: values.name,
                                      project_id: projectId,
                                      description: values.description,
                                      type: values.type,
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
                                      label={t(
                                        'cloud:custom_protocol.thing.name',
                                      )}
                                      error={formState.errors['name']}
                                      registration={register('name')}
                                    />
                                    <SelectField
                                      label={t(
                                        'cloud:custom_protocol.thing.type',
                                      )}
                                      error={formState.errors['type']}
                                      registration={register('type')}
                                      options={thingTypeList}
                                      onChange={event =>
                                        setThingType(
                                          String(
                                            event.target.value,
                                          ).toLowerCase(),
                                        )
                                      }
                                    />
                                    {thingType === 'thing' ||
                                    thingType === 'template' ? (
                                      <InputField
                                        label={t(
                                          'cloud:custom_protocol.thing.base_template',
                                        )}
                                        error={
                                          formState.errors['base_template']
                                        }
                                        registration={register('base_template')}
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
                              className="mt-3 w-full"
                              variant="primary"
                              size="square"
                            >
                              {t('cloud:custom_protocol.thing.create')}
                            </Button>
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
                      </div>
                    </Tab.Panel>
                    <Tab.Panel
                      className={clsx(
                        'flex grow flex-col bg-white focus:outline-none',
                      )}
                    >
                      <div className="flex grow flex-col px-9 py-3 shadow-lg">
                        <div className="space-y-1">
                          <SelectDropdown
                            isClearable={true}
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
                            placeholder={t(
                              'cloud:custom_protocol.service.choose',
                            )}
                            onChange={e => {
                              setOptionService(e)
                              setValue('handle_service', e?.value)
                            }}
                            value={optionThingService}
                          />
                          <p className="text-body-sm text-primary-400">
                            {formState?.errors?.handle_service?.message}
                          </p>
                        </div>
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
                                console.log('service values', selectedThingId)
                                mutateService({
                                  data: {
                                    name: values.name,
                                    description: values.description,
                                    output: values.output,
                                    input: inputService,
                                    code: codeInput,
                                  },
                                  thingId: selectedThingId,
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
                                        setThingType(
                                          String(
                                            event.target.value,
                                          ).toLowerCase(),
                                        )
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
                              className="mt-3 w-full"
                              variant="primary"
                              size="square"
                            >
                              {t('cloud:custom_protocol.service.create')}
                            </Button>
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
                      </div>
                    </Tab.Panel>
                  </Tab.Panels>
                </div>
              </Tab.Group>
              <div className="!mt-3 flex justify-between">
                <Button
                  className="justify-start border-none hover:text-primary-400"
                  variant="trans"
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
                  className="justify-start border-none hover:text-primary-400"
                  variant="trans"
                  size="square"
                  onClick={() =>
                    setSelectedIndex(selectedIndex =>
                      selectedIndex < 2 ? selectedIndex + 1 : 2,
                    )
                  }
                  disabled={selectedIndex === 2}
                >
                  {t('btn:next')}
                </Button>
              </div>
            </>
          )
        }}
      </FormMultipleFields>
    </Drawer>
  )
}
