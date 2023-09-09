import { useTranslation } from 'react-i18next'
import { Tab } from '@headlessui/react'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import * as z from 'zod'

import { Button } from '~/components/Button'
import {
  Form,
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
  contentTypeList,
  entityThingSchema,
  protocolList,
  serviceThingSchema,
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

import { type AdapterTableContextMenuProps } from './AdapterTable'
import { inputService, type EntityThingList } from '../types'
import { type BasePagination } from '~/types'
import { nameSchema, selectOptionSchema } from '~/utils/schemaValidation'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'

type UpdateDeviceProps = {
  close: () => void
  isOpen: boolean
  thingData: GetEntityThingsRes
  refetchThingData: any
} & AdapterTableContextMenuProps

export const updateAdapterSchema = z
  .object({
    name: nameSchema,
    project_id: z.string().optional(),
    content_type: z.enum(['json', 'hex', 'text'] as const),
    thing_id: z.string(),
    handle_service: z.string(),
  })
  .and(
    z.discriminatedUnion('protocol', [
      z.object({
        protocol: z.enum(['tcp', 'udp'] as const),
      }),
      z.object({
        protocol: z.literal('mqtt'),
        host: z.string(),
        port: z.string(),
        password: z.string(),
        topic: z.string(),
      }),
    ]),
  )

export function UpdateAdapter({
  id,
  name,
  protocol,
  content_type,
  thing_id,
  handle_service,
  host,
  password,
  port,
  topic,
  close,
  isOpen,
  thingData,
  refetchThingData,
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

  const {
    data: dataCreateThing,
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

  const [selectedThing, setSelectedThing] = useState<SelectOption>()
  const [optionThingId, setOptionThingId] = useState<SelectOption>({
    label: '',
    value: '',
  })

  console.log(thingSelectData, thing_id, 'thingSelectData')
  const { data: serviceData } = useGetServiceThings({
    thingId: selectedThingId ? selectedThingId : thing_id,
    config: { enabled: !!selectedThingId, suspense: false },
  })
  useEffect(() => {
    if (selectedThing != null) {
      setSelectedThing(undefined)
    }
  }, [])
  const serviceSelectData = serviceData?.data?.map(service => ({
    value: service.name,
    label: service.name,
  })) || [{ value: '', label: '' }]

  const [codeInput, setCodeInput] = useState('')

  const { mutate: mutatePingMQTT, isLoading: isLoadingPingMQTT } = usePingMQTT()

  const [isCreateAdapterFormUpdated, setIsCreateAdapterFormUpdated] =
    useState(false)
  const protocolTypeRef = useRef(protocol)

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
              <img src={btnCancelIcon} alt="Submit" className="h-5 w-5" />
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
            disabled={
              !isCreateAdapterFormUpdated &&
              protocolTypeRef.current === protocolType
            }
          />
        </>
      )}
    >
      <Form<UpdateAdapterDTO['data'], typeof updateAdapterSchema>
        id="update-adapter"
        className="flex flex-col justify-between"
        onSubmit={values => {
          // console.log('adapter values', values)
          if (protocolType === 'mqtt') {
            mutate({
              data: {
                name: values.name,
                project_id: projectId,
                protocol: values.protocol,
                content_type: values.content_type,
                thing_id: selectedThingId,
                handle_service: values.handle_service,
                host: values.host,
                port: values.port,
                password: values.password,
                topic: values.topic.split(',').map(word => word.trim() + '/#'),
              },
              id,
            })
          } else {
            mutate({
              data: {
                name: values.name,
                project_id: projectId,
                protocol: values.protocol,
                content_type: values.content_type,
                thing_id: selectedThingId,
                handle_service: values.handle_service,
              },
              id,
            })
          }
        }}
        schema={updateAdapterSchema}
        options={{
          defaultValues: {
            name,
            content_type,
            handle_service: handle_service,
            host,
            password,
            port,
            protocol,
            thing_id: thing_id,
            topic:
              topic !== 'null'
                ? JSON.parse(topic)
                  .map((item: string) => item.split('/')[0])
                  .join(', ')
                : null,
          },
        }}
      >
        {({ register, formState, control, watch, setValue }) => {
          // console.log('zod adapter errors: ', formState.errors)
          setIsCreateAdapterFormUpdated(formState.isDirty)

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
                    {/* <Tab
                      className={({ selected }) =>
                        clsx(
                          'py-2.5 text-body-sm hover:text-primary-400 focus:outline-none',
                          { 'text-primary-400': selected },
                        )
                      }
                    >
                      <div className="flex items-center gap-x-2">
                        <p>{t('cloud:custom_protocol.finish')}</p>
                      </div>
                    </Tab> */}
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
                        />
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
                              label={t('cloud:custom_protocol.adapter.pass')}
                              error={formState.errors['password']}
                              registration={register('password')}
                            />
                            <InputField
                              label={t('cloud:custom_protocol.adapter.topic')}
                              error={formState.errors['topic']}
                              registration={register('topic')}
                            />
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
                                      password: watch('password'),
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
                                      options={[
                                        {
                                          label: t(
                                            'cloud:custom_protocol.thing.thing',
                                          ),
                                          value: 'thing',
                                          selected: true,
                                        },
                                        {
                                          label: t(
                                            'cloud:custom_protocol.thing.template',
                                          ),
                                          value: 'template',
                                        },
                                        {
                                          label: t(
                                            'cloud:custom_protocol.thing.shape',
                                          ),
                                          value: 'shape',
                                        },
                                      ]}
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
                              console.log(e, 'hahaha')
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
                                // console.log('service values', values)
                                mutateService({
                                  data: {
                                    name: values.name,
                                    description: values.description,
                                    output: values.output,
                                    input: inputService,
                                    code: codeInput,
                                  },
                                  thingId: selectedThing?.value as string,
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
                                      options={[
                                        {
                                          label: t(
                                            'cloud:custom_protocol.service.json',
                                          ),
                                          value: 'json',
                                        },
                                        {
                                          label: t(
                                            'cloud:custom_protocol.service.str',
                                          ),
                                          value: 'str',
                                        },
                                        {
                                          label: t(
                                            'cloud:custom_protocol.service.i32',
                                          ),
                                          value: 'i32',
                                        },
                                        {
                                          label: t(
                                            'cloud:custom_protocol.service.i64',
                                          ),
                                          value: 'i64',
                                        },
                                        {
                                          label: t(
                                            'cloud:custom_protocol.service.f32',
                                          ),
                                          value: 'f32',
                                        },
                                        {
                                          label: t(
                                            'cloud:custom_protocol.service.f64',
                                          ),
                                          value: 'f64',
                                        },
                                        {
                                          label: t(
                                            'cloud:custom_protocol.service.bool',
                                          ),
                                          value: 'bool',
                                        },
                                        {
                                          label: t(
                                            'cloud:custom_protocol.service.time',
                                          ),
                                          value: 'time',
                                        },
                                        {
                                          label: t(
                                            'cloud:custom_protocol.service.bin',
                                          ),
                                          value: 'bin',
                                        },
                                      ]}
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
              <div
                className="flex justify-between"
                style={{ marginTop: '10px' }}
              >
                <Button
                  className="border-none hover:text-primary-400"
                  style={{ justifyContent: 'flex-start' }}
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
                  className="border-none hover:text-primary-400"
                  style={{ justifyContent: 'flex-start' }}
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
      </Form>
    </Drawer>
  )
}
