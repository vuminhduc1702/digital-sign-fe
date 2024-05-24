import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { InputField, type SelectOption } from '@/components/Form'
import {
  type UpdateAdapterDTO,
  useUpdateAdapter,
  usePingMQTT,
} from '../api/adapter'
import {
  adapterSchema,
  contentTypeList,
  protocolList,
  contentTypeFTPList,
  encryptedList,
} from './CreateAdapter'
import storage from '@/utils/storage'
import { useGetEntityThings } from '../api/entityThing'
import { useGetServiceThings } from '../api/serviceThing'
import TitleBar from '@/components/Head/TitleBar'
import { cn } from '@/utils/misc'
import { CreateThing } from '@/cloud/flowEngineV2/components/Attributes'
import { CreateService } from './CreateService'

import { type AdapterTableContextMenuProps } from './AdapterTable'
import { type FieldsType } from '../types'
import { type SelectInstance } from 'react-select'

import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import { PlusIcon } from '@/components/SVGIcons'
import { LuChevronDown, LuChevronRight } from 'react-icons/lu'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { NewSelectDropdown } from '@/components/Form/NewSelectDropdown'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

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
  encrypted,
}: UpdateDeviceProps) {
  const { t } = useTranslation()

  const { mutate, isLoading, isSuccess } = useUpdateAdapter()

  const projectId = storage.getProject()?.id
  const [isShow, setIsShow] = useState(true)
  const [isEncrypted, setIsEncrypted] = useState<boolean>(!!encrypted)

  const { data: thingData, isLoading: AdapterIsLoading } = useGetEntityThings({
    projectId,
    type: 'thing',
  })
  const thingSelectData = thingData?.data?.list?.map(thing => ({
    value: thing.id,
    label: thing.name,
  }))

  console.log('encrypted', encrypted)

  const form = useForm<UpdateAdapterDTO['data']>({
    resolver: adapterSchema && zodResolver(adapterSchema),
    defaultValues: {
      name,
      thing_id,
      handle_service,
      protocol,
      content_type,
      host,
      port,
      configuration: configuration,
      schema: { fields: renderFields() },
      encrypted,
      encrypted_select: encrypted ? 'option' : '',
    },
  })
  const {
    register,
    formState,
    control,
    handleSubmit,
    watch,
    getValues,
    reset,
  } = form

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

  const { data: serviceData, isLoading: isLoadingService } =
    useGetServiceThings({
      thingId: getValues('thing_id') || thing_id,
      config: { enabled: !!getValues('thing_id') },
    })
  const serviceSelectData = serviceData?.data?.map(service => ({
    value: service.name,
    label: service.name,
  }))

  const { mutate: mutatePingMQTT, isLoading: isLoadingPingMQTT } = usePingMQTT()

  function renderFields() {
    const result =
      schema?.fields?.map((item: FieldsType) => ({
        name: item.name,
        start_byte: item.start_byte,
        length_byte: item.end_byte - item.start_byte,
      })) || []
    return result
  }

  const selectDropdownServiceRef = useRef<SelectInstance<SelectOption> | null>(
    null,
  )

  useEffect(() => {
    if (isSuccess && close) {
      close()
    }
  }, [isSuccess])

  useEffect(() => {
    reset()
    setIsEncrypted(!!encrypted)
  }, [isOpen])

  const resetForm = () => {
    close()
    form.reset()
  }

  return (
    <Sheet open={isOpen} onOpenChange={resetForm} modal={false}>
      <SheetContent
        onInteractOutside={e => {
          e.preventDefault()
        }}
        className={cn('flex h-full max-w-xl flex-col justify-between')}
      >
        <SheetHeader>
          <SheetTitle>
            {t('cloud:custom_protocol.adapter.table.edit')}
          </SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
          <Form {...form}>
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
                    encrypted: isEncrypted
                      ? values.encrypted_select === 'AES128'
                        ? values.encrypted_select
                        : values.encrypted
                          ? values.encrypted
                          : null
                      : null,
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
                    encrypted: isEncrypted
                      ? values.encrypted_select === 'AES128'
                        ? values.encrypted_select
                        : values.encrypted
                          ? values.encrypted
                          : null
                      : null,
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
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('cloud:custom_protocol.adapter.name')}
                        </FormLabel>
                        <div>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  {!AdapterIsLoading ? (
                    <div className="relative w-full">
                      <div className="w-[calc(100%-2.5rem)]">
                        <FormField
                          control={form.control}
                          name="thing_id"
                          render={({
                            field: { onChange, value, ...field },
                          }) => (
                            <FormItem>
                              <FormLabel>
                                {t('cloud:custom_protocol.thing.id')}
                              </FormLabel>
                              <div>
                                <FormControl>
                                  <NewSelectDropdown
                                    isClearable={true}
                                    customOnChange={onChange}
                                    options={thingSelectData}
                                    isOptionDisabled={option =>
                                      option.label ===
                                        t('loading:entity_thing') ||
                                      option.label === t('table:no_thing')
                                    }
                                    noOptionsMessage={() => t('table:no_thing')}
                                    loadingMessage={() =>
                                      t('loading:entity_thing')
                                    }
                                    isLoading={AdapterIsLoading}
                                    placeholder={t(
                                      'cloud:custom_protocol.thing.choose',
                                    )}
                                    defaultValue={thingSelectData.find(
                                      thing =>
                                        thing.value === getValues('thing_id'),
                                    )}
                                    handleClearSelectDropdown={() =>
                                      selectDropdownServiceRef.current?.clearValue()
                                    }
                                    handleChangeSelect={() =>
                                      selectDropdownServiceRef.current?.clearValue()
                                    }
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      <CreateThing
                        thingType="thing"
                        classNameTriggerBtn="h-[38px] absolute right-0 bottom-0"
                      />
                    </div>
                  ) : null}
                  {!isLoadingService ? (
                    <div className="relative w-full">
                      <div className="w-[calc(100%-2.5rem)]">
                        <FormField
                          control={form.control}
                          name="handle_service"
                          render={({
                            field: { onChange, value, ...field },
                          }) => (
                            <FormItem>
                              <FormLabel>
                                {t('cloud:custom_protocol.service.title')}
                              </FormLabel>
                              <div>
                                <FormControl>
                                  <NewSelectDropdown
                                    isClearable={true}
                                    customOnChange={onChange}
                                    options={serviceSelectData}
                                    isOptionDisabled={option =>
                                      option.label ===
                                        t('loading:service_thing') ||
                                      option.label === t('table:no_service')
                                    }
                                    isLoading={
                                      watch('thing_id') != null
                                        ? isLoadingService
                                        : false
                                    }
                                    loadingMessage={() =>
                                      t('loading:service_thing')
                                    }
                                    noOptionsMessage={() =>
                                      t('table:no_service')
                                    }
                                    placeholder={t(
                                      'cloud:custom_protocol.service.choose',
                                    )}
                                    defaultValue={serviceSelectData?.find(
                                      service =>
                                        service.value ===
                                        getValues('handle_service'),
                                    )}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      <CreateService
                        thingId={watch('thing_id')}
                        classNameTriggerBtn="h-[38px] absolute right-0 bottom-0"
                      />
                    </div>
                  ) : null}
                  <FormField
                    control={form.control}
                    name="protocol"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormLabel>
                          {t('cloud:custom_protocol.protocol')}
                        </FormLabel>
                        <div>
                          <Select
                            {...field}
                            onValueChange={e => onChange(e)}
                            value={value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t('placeholder:select')}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {protocolList.map(template => (
                                <SelectItem
                                  key={template.label}
                                  value={template.value}
                                >
                                  {template.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  {watch('protocol') === 'ftp' ? (
                    <FormField
                      control={form.control}
                      name="content_type"
                      render={({ field: { onChange, value, ...field } }) => (
                        <FormItem>
                          <FormLabel>
                            {t(
                              'cloud:custom_protocol.adapter.content_type.title',
                            )}
                          </FormLabel>
                          <div>
                            <Select
                              {...field}
                              onValueChange={e => onChange(e)}
                              value={value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={t('placeholder:select')}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {contentTypeFTPList.map(template => (
                                  <SelectItem
                                    key={template.label}
                                    value={template.value}
                                  >
                                    {template.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormField
                      control={form.control}
                      name="content_type"
                      render={({ field: { onChange, value, ...field } }) => (
                        <FormItem>
                          <FormLabel>
                            {t(
                              'cloud:custom_protocol.adapter.content_type.title',
                            )}
                          </FormLabel>
                          <div>
                            <Select
                              {...field}
                              onValueChange={e => onChange(e)}
                              value={value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={t('placeholder:select')}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {contentTypeList.map(template => (
                                  <SelectItem
                                    key={template.label}
                                    value={template.value}
                                  >
                                    {template.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
                  <Switch
                    onCheckedChange={checked => setIsEncrypted(checked)}
                    checked={isEncrypted}
                  />
                  {isEncrypted && (
                    <FormField
                      control={form.control}
                      name="encrypted_select"
                      render={({ field: { onChange, value, ...field } }) => (
                        <FormItem>
                          <FormLabel>
                            {t('cloud:custom_protocol.adapter.encryption')}
                          </FormLabel>
                          <div>
                            <Select
                              {...field}
                              onValueChange={onChange}
                              value={value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={t('placeholder:select')}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {encryptedList.map(option => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
                  {watch('encrypted_select') === 'option' && isEncrypted && (
                    <FormField
                      control={form.control}
                      name="encrypted"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('cloud:custom_protocol.adapter.encrypted')}
                          </FormLabel>
                          <div>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
                  {watch('content_type') != null &&
                  watch('content_type') !== '' &&
                  watch('content_type') !== 'json' &&
                  watch('protocol') !== 'ftp' ? (
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
                            <FormField
                              control={form.control}
                              name={`schema.fields.${index}.name` as const}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    {t(
                                      'cloud:custom_protocol.adapter.schema.name',
                                    )}
                                  </FormLabel>
                                  <div>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </div>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={
                                `schema.fields.${index}.start_byte` as const
                              }
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    {t(
                                      'cloud:custom_protocol.adapter.schema.start_byte',
                                    )}
                                  </FormLabel>
                                  <div>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        {...field}
                                        {...register(
                                          `schema.fields.${index}.start_byte`,
                                          {
                                            valueAsNumber: true,
                                          },
                                        )}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </div>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={
                                `schema.fields.${index}.length_byte` as const
                              }
                              render={({ field }) => {
                                return (
                                  <FormItem>
                                    <FormLabel>
                                      {t(
                                        'cloud:custom_protocol.adapter.schema.length_byte',
                                      )}
                                    </FormLabel>
                                    <div>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          {...field}
                                          {...register(
                                            `schema.fields.${index}.length_byte`,
                                            {
                                              valueAsNumber: true,
                                            },
                                          )}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </div>
                                  </FormItem>
                                )
                              }}
                            />
                            {/* <InputField
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
                          /> */}
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
                      <FormField
                        control={form.control}
                        name="host"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('cloud:custom_protocol.adapter.host')}
                            </FormLabel>
                            <div>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="port"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('cloud:custom_protocol.adapter.port')}
                            </FormLabel>
                            <div>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="configuration.credentials.username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('cloud:custom_protocol.adapter.username')}
                            </FormLabel>
                            <div>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="configuration.credentials.password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('cloud:custom_protocol.adapter.pass')}
                            </FormLabel>
                            <div>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
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
                          <FormField
                            control={form.control}
                            name={
                              `configuration.topic_filters.${index}.topic` as const
                            }
                            render={({ field }) => (
                              <FormItem className="mr-[42px] flex items-center gap-x-3">
                                <FormLabel>
                                  {`${t('cloud:custom_protocol.adapter.topic')} ${index + 1}`}
                                </FormLabel>
                                <div>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
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
          </Form>
        </div>

        <SheetFooter>
          <Button
            className="rounded border-none"
            variant="secondary"
            size="lg"
            onClick={resetForm}
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
            disabled={!formState.isDirty || isLoading}
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
