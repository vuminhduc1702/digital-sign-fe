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
} from '~/components/Form'
import { type CreateAdapterDTO, useCreateAdapter } from '../api/adapter'
import storage from '~/utils/storage'
import {
  useCreateEntityThing,
  type CreateEntityThingDTO,
  useGetEntityThings,
} from '../api/entityThing'
import { FormDialog } from '~/components/FormDialog'
import { queryClient } from '~/lib/react-query'

import { nameSchema, selectOptionSchema } from '~/utils/schemaValidation'
import { type EntityThingList } from '../types'
import { type BasePagination } from '~/types'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { useGetServiceThings } from '../api/serviceThing'

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
        password: z.string().min(1, { message: 'Vui lòng nhập password' }),
        // topic: z.array(z.string()),
        topic: z.string().min(1, { message: 'Vui lòng nhập topic' }),
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
        type: z.enum(['thing', 'template'] as const),
        base_template: z.string().optional(),
      }),
      z.object({
        type: z.literal('shape'),
        base_shapes: z.string().optional(),
      }),
    ]),
  )

export const serviceThingSchema = z.object({
  name: nameSchema,
  description: z.string(),
  input: z.array(z.object({ name: z.string(), type: z.string() })),
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
  code: z.string().min(1, { message: 'Vui lòng nhập code' }),
})

export function CreateAdapter() {
  const { t } = useTranslation()

  const { id: projectId } = storage.getProject()

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [protocolType, setProtocolType] = useState('tcp')
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
  const thingSelectData = thingData?.data.list.map(thing => ({
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
  // console.log('defaultThingValues', defaultThingValues)

  // const { data: serviceData, refetch: refetchServiceData } =
  //   useGetServiceThings({
  //     thingId: thingSelectData.value
  //     config: { enabled: false },
  //   })
  // const serviceListCache = queryClient.getQueryData(['service-things'], {
  //   exact: false,
  // })
  // const serviceSelectData = serviceData?.data.map(service => ({
  //   value: service.name,
  //   label: service.name,
  // })) || [{ value: '', label: '' }]

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
    >
      <Form<CreateAdapterDTO['data'], typeof adapterSchema>
        id="create-adapter"
        className="flex flex-col justify-between"
        onSubmit={values => {
          // console.log('adapter values', values)
          // mutate({
          //   data: {
          //     project_id: projectId,
          //     name: values.name,
          //     protocol: (
          //       values.protocol as unknown as {
          //         value: string
          //         label: string
          //       }
          //     )?.value,
          //     content_type: (
          //       values.content_type as unknown as {
          //         value: string
          //         label: string
          //       }
          //     )?.value,
          //   },
          // })
        }}
        schema={adapterSchema}
      >
        {({ register, formState, control }) => {
          console.log('zod adapter errors: ', formState.errors)
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
                    <Tab
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
                          options={[
                            {
                              label: t(
                                'cloud:custom_protocol.adapter.protocol.mqtt',
                              ),
                              value: 'mqtt',
                            },
                            {
                              label: t(
                                'cloud:custom_protocol.adapter.protocol.tcp',
                              ),
                              value: 'tcp',
                              selected: true,
                            },
                            {
                              label: t(
                                'cloud:custom_protocol.adapter.protocol.udp',
                              ),
                              value: 'udp',
                            },
                          ]}
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
                          options={[
                            {
                              label: t(
                                'cloud:custom_protocol.adapter.content_type.json',
                              ),
                              value: 'json',
                            },
                            {
                              label: t(
                                'cloud:custom_protocol.adapter.content_type.hex',
                              ),
                              value: 'hex',
                            },
                            {
                              label: t(
                                'cloud:custom_protocol.adapter.content_type.text',
                              ),
                              value: 'text',
                            },
                          ]}
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
                                console.log('thing values', values)
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
                            label={t('cloud:custom_protocol.service.title')}
                            name="handle_service"
                            control={control}
                            options={
                              thingData
                                ? thingSelectData
                                : [
                                    {
                                      label: t('loading:service_thing'),
                                      value: '',
                                    },
                                  ]
                            }
                            isOptionDisabled={option =>
                              option.label === t('loading:service_thing')
                            }
                            noOptionsMessage={() => t('table:no_service')}
                            onMenuOpen={() => {
                              if (thingListCache?.data.list) {
                                return
                              } else refetchThingData()
                            }}
                            // defaultValue={defaultThingValues}
                          />
                          <p className="text-body-sm text-primary-400">
                            {formState?.errors?.thing_id?.message}
                          </p>
                        </div>
                        <FormDialog
                          isDone={isSuccessThing}
                          title={t('cloud:custom_protocol.service.create')}
                          body={
                            <Form<
                              CreateEntityThingDTO['data'],
                              typeof entityThingSchema
                            >
                              id="create-serviceThing"
                              className="flex flex-col justify-between"
                              onSubmit={values => {
                                console.log('service values', values)
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
                                console.log(
                                  'zod service errors: ',
                                  formState.errors,
                                )
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
                        FinishedForm
                      </div>
                    </Tab.Panel>
                  </Tab.Panels>
                </div>
              </Tab.Group>
              <div className="flex justify-between">
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
                      selectedIndex < 3 ? selectedIndex + 1 : 3,
                    )
                  }
                  disabled={selectedIndex === 3}
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
