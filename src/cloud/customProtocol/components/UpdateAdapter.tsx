import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '~/components/Button'
import { InputField, SelectDropdown, SelectField } from '~/components/Form'
import { Drawer } from '~/components/Drawer'
import {
  type UpdateAdapterDTO,
  useUpdateAdapter,
  usePingMQTT,
} from '../api/adapter'
import { adapterSchema, contentTypeList, protocolList } from './CreateAdapter'
import storage from '~/utils/storage'
import { useGetEntityThings } from '../api/entityThing'
import { useGetServiceThings } from '../api/serviceThing'
import TitleBar from '~/components/Head/TitleBar'
import { cn } from '~/utils/misc'
import { CreateThing } from '~/cloud/flowEngineV2/components/Attributes'
import { CreateService } from './CreateService'

import { type AdapterTableContextMenuProps } from './AdapterTable'
import { type FieldsType } from '../types'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import { PlusIcon } from '~/components/SVGIcons'
import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons'

type UpdateDeviceProps = {
  close: () => void
  isOpen: boolean
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
  const [isShow, setIsShow] = useState(true)

  const { data: thingData } = useGetEntityThings({
    projectId,
    type: 'thing',
  })
  const thingSelectData = thingData?.data?.list?.map(thing => ({
    value: thing.id,
    label: thing.name,
  }))

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
              mutate({ data, id })
            }
            if (
              values.content_type === 'hex' ||
              values.content_type === 'text'
            ) {
              mutate({
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
                id,
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
              mutate({ data, id })
            }
            if (
              values.content_type === 'hex' ||
              values.content_type === 'text'
            ) {
              mutate({
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
                id,
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
            {thingSelectData != null ? (
              <div className="w-[calc(100%-2.5rem)] space-y-1">
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
                  defaultValue={thingSelectData.find(
                    thing => thing.value === getValues('thing_id'),
                  )}
                />
                <p className="text-body-sm text-primary-400">
                  {formState?.errors?.thing_id?.message}
                </p>
              </div>
            ) : null}
            {serviceSelectData != null ? (
              <div className="w-[calc(100%-2.5rem)] space-y-1">
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
                />
                <p className="text-body-sm text-primary-400">
                  {formState?.errors?.handle_service?.message}
                </p>
              </div>
            ) : null}
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
      <CreateThing
        thingType="thing"
        classNameTriggerBtn="absolute right-0 top-[102px] mr-6"
      />
      <CreateService
        thingId={watch('thing_id')}
        classNameTriggerBtn="absolute right-0 top-[186px] mr-6"
      />
    </Drawer>
  )
}
