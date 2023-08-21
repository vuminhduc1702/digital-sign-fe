import { useTranslation } from 'react-i18next'
import { Tab } from '@headlessui/react'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import * as z from 'zod'

import { Button } from '~/components/Button'
import {
  Form,
  FormDrawer,
  InputField,
  SelectDropdown,
  SelectField,
  type SelectOption,
} from '~/components/Form'
import {
  type CreateAdapterDTO,
  useCreateAdapter,
  usePingMQTT,
} from '../api/adapter'
import storage from '~/utils/storage'
import {
  useCreateEntityThing,
  type CreateEntityThingDTO,
  useGetEntityThings,
} from '../api/entityThing'
import { FormDialog } from '~/components/FormDialog'
import { queryClient } from '~/lib/react-query'
import {
  type CreateServiceThingDTO,
  useGetServiceThings,
  useCreateServiceThing,
} from '../api/serviceThing'
import { CodeEditor } from './CodeEditor'

import { nameSchema, selectOptionSchema } from '~/utils/schemaValidation'
import { inputService, type EntityThingList } from '../types'
import { type BasePagination } from '~/types'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

export const adapterSchema = z
  .object({
    name: nameSchema,
    project_id: z.string().optional(),
    content_type: z.enum(['json', 'hex', 'text'] as const),
    thing_id: selectOptionSchema(),
    handle_service: selectOptionSchema(),
  })
  .and(
    z.discriminatedUnion('protocol', [
      z.object({
        protocol: z.enum(['tcp', 'udp'] as const),
      }),
      z.object({
        protocol: z.literal('mqtt'),
        host: z.string().min(1, { message: 'Vui lòng nhập host' }),
        port: z.string().min(1, { message: 'Vui lòng nhập port' }),
        password: z.string(),
        topic: z.string().min(1, { message: 'Vui lòng nhập topic' }),
      }),
    ]),
  )

export const entityThingSchema = z
  .object({
    name: nameSchema,
    project_id: z.string().optional(),
    description: z.string(),
    base_template: z.string().nullable(),
  })
  .and(
    z.discriminatedUnion('type', [
      z.object({
        type: z.enum(['thing', 'template'] as const),
        base_template: z.string().nullable(),
      }),
      z.object({
        type: z.literal('shape'),
        base_shapes: z.string().nullable(),
      }),
    ]),
  )

export const serviceThingSchema = z.object({
  name: nameSchema,
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

export const protocolList = [
  {
    label: 'MQTT',
    value: 'mqtt',
  },
  {
    label: 'TCP',
    value: 'tcp',
  },
  {
    label: 'UDP',
    value: 'udp',
  },
]

export const contentTypeList = [
  {
    label: 'JSON',
    value: 'json',
  },
  {
    label: 'Hex',
    value: 'hex',
  },
  {
    label: 'Text',
    value: 'text',
  },
]

export function CreateAdapter() {
  const { t } = useTranslation()

  const { id: projectId } = storage.getProject()

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [protocolType, setProtocolType] = useState('mqtt')
  const [thingType, setThingType] = useState('thing')

  const {
    mutate: mutateAdapter,
    isLoading: isLoadingAdapter,
    isSuccess: isSuccessAdapter,
  } = useCreateAdapter()

  const {
    data: dataCreateThing,
    mutate: mutateThing,
    isLoading: isLoadingThing,
    isSuccess: isSuccessThing,
  } = useCreateEntityThing()

  const { data: thingData, refetch: refetchThingData } = useGetEntityThings({
    projectId,
    config: { enabled: false },
  })
  const thingListCache:
    | ({ data: EntityThingList } & BasePagination)
    | undefined = queryClient.getQueryData(['entity-things'], { exact: false })
  const thingSelectData = thingData?.data?.list?.map(thing => ({
    value: thing.id,
    label: thing.name,
  })) || [{ value: '', label: '' }]

  // TODO: Auto set default when user create new thing successfully
  // const [defaultThingValues, setDefaultThingValues] = useState(null)
  // useEffect(() => {
  //   if (dataCreateThing) {
  //     setDefaultThingValues([
  //       {
  //         label: thingSelectData?.find(
  //           thingSelect => thingSelect.value === dataCreateThing?.data.id,
  //         )?.label,
  //         value: dataCreateThing?.data.id,
  //       },
  //     ])
  //   }
  // }, [dataCreateThing])

  const {
    mutate: mutateService,
    isLoading: isLoadingService,
    isSuccess: isSuccessService,
  } = useCreateServiceThing()

  const [selectedThing, setSelectedThing] = useState<SelectOption>()
  const { data: serviceData } = useGetServiceThings({
    thingId: (selectedThing?.value as string) ?? '',
    config: { enabled: !!selectedThing, suspense: false },
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

  const {
    data: thingDataTemplate,
    isPreviousData,
    isSuccess,
  } = useGetEntityThings({
    projectId,
    type: 'template',
    config: { keepPreviousData: true },
  })

  const thingSelectDataTemplate = thingDataTemplate?.data?.list?.map(thing => ({
    value: thing.id,
    label: thing.name,
  })) || [{ value: '', label: '' }]

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
      otherState={protocolType}
      setOtherState={setProtocolType}
    >
      <Form<CreateAdapterDTO['data'], typeof adapterSchema>
        id="create-adapter"
        className="flex flex-col justify-between"
        onSubmit={values => {
          // console.log('adapter values', values)
          if (protocolType === 'mqtt') {
            mutateAdapter({
              data: {
                project_id: projectId,
                name: values.name,
                protocol: values.protocol,
                content_type: values.content_type,
                thing_id: values.thing_id.value,
                handle_service: values.handle_service.value,
                host: values.host,
                port: values.port,
                password: values.password,
                topic: values.topic.split(',').map(word => word.trim() + '/#'),
              },
            })
          } else {
            mutateAdapter({
              data: {
                project_id: projectId,
                name: values.name,
                protocol: values.protocol,
                content_type: values.content_type,
                thing_id: values.thing_id.value,
                handle_service: values.handle_service.value,
              },
            })
          }
        }}
        schema={adapterSchema}
      >
        {({ register, formState, control, watch }) => {
          // console.log('zod adapter errors: ', formState.errors)
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
                          onChange={event =>
                            setProtocolType(
                              String(event.target.value).toLowerCase(),
                            )
                          }
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
                            onMenuClose={() => {
                              const selectedThingWatch = watch(
                                'thing_id',
                              ) as SelectOption
                              setSelectedThing(selectedThingWatch)
                            }}
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
                                      <SelectField
                                        label={t(
                                          'cloud:custom_protocol.thing.base_template',
                                        )}
                                        error={
                                          formState.errors['base_template']
                                        }
                                        registration={register('base_template')}
                                        options={thingSelectDataTemplate}
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
                            label={t('cloud:custom_protocol.service.title')}
                            inputId="handleServiceForm"
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
                              disabled={!selectedThing?.value}
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
    </FormDrawer>
  )
}
