import { useGetEntityThings } from '@/cloud/customProtocol/api/entityThing'
import { CreateService } from '@/cloud/customProtocol/components/CreateService'
import { CreateThing } from '@/cloud/flowEngineV2/components/Attributes'
import { useGetAttrs } from '@/cloud/orgManagement/api/attrAPI'
import {
  booleanSelectOption,
  numberInput,
  valueTypeList,
} from '@/cloud/orgManagement/components/Attributes'
import {
  FieldWrapper,
  InputField,
  SelectField,
  type SelectOption,
} from '@/components/Form'
import { NewSelectDropdown } from '@/components/Form/NewSelectDropdown'
import { Spinner } from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { axios } from '@/lib/axios'
import storage from '@/utils/storage'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { type SelectInstance } from 'react-select'
import { useSpinDelay } from 'spin-delay'
import { useUpdateTemplate, type UpdateTemplateDTO } from '../api'
import { templateAttrSchema } from './CreateTemplate'

import { type Attribute } from '@/types'
import { type Template } from '../types'

import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/utils/misc'

type UpdateTemplateProps = {
  selectedUpdateTemplate: Template
  close: () => void
  isOpen: boolean
}
export function UpdateTemplate({
  selectedUpdateTemplate,
  close,
  isOpen,
}: UpdateTemplateProps) {
  const { t } = useTranslation()
  const { mutate, isLoading, isSuccess } = useUpdateTemplate()

  useEffect(() => {
    if (isSuccess && close) {
      close()
    }
  }, [isSuccess])

  const projectId = storage.getProject()?.id
  const valueTypeOptions = valueTypeList.map(valueType => ({
    label: valueType.name,
    value: valueType.type,
  }))

  const { data: attrData, isLoading: attrLoading } = useGetAttrs({
    entityType: 'TEMPLATE',
    entityId: selectedUpdateTemplate?.id,
  })

  const { data: thingData, isLoading: AdapterIsLoading } = useGetEntityThings({
    projectId,
    type: 'thing',
  })
  const thingSelectData = thingData?.data?.list?.map(thing => ({
    value: thing?.id,
    label: thing?.name,
  }))

  const form = useForm<UpdateTemplateDTO['data']>({
    resolver: templateAttrSchema && zodResolver(templateAttrSchema),
  })

  const {
    register,
    formState,
    watch,
    handleSubmit,
    reset,
    control,
    getValues,
  } = form

  const [serviceData, setServiceData] = useState(null)
  const [isLoadingService, setIsLoadingService] = useState(false)
  useEffect(() => {
    const thingid = getValues('thing_id')
    if (thingid !== 'undefined' && thingid !== undefined) {
      const fetchData = async () => {
        try {
          setIsLoadingService(true)
          const response = await axios.get(`/api/fe/thing/${thingid}/service`)
          const fetchedServiceData = response?.data
          setServiceData(fetchedServiceData)
        } catch (error) {
          console.error('Error fetching data:', error)
        } finally {
          setIsLoadingService(false)
        }
      }
      fetchData()
    }
  }, [getValues('thing_id')])
  const serviceSelectData = serviceData?.map(service => ({
    value: service?.name,
    label: service?.name,
  }))
  const { fields, append, remove } = useFieldArray({
    name: 'attributes',
    control,
  })
  useEffect(() => {
    if (attrData != null && selectedUpdateTemplate) {
      reset({
        name: selectedUpdateTemplate.name,
        rule_chain_id: selectedUpdateTemplate?.rule_chain_id,
        thing_id: selectedUpdateTemplate?.thing_id,
        handle_msg_svc: selectedUpdateTemplate?.handle_message_svc,
        attributes: attrData?.attributes.map((attribute: Attribute) => ({
          attribute_key: attribute.attribute_key,
          logged: attribute.logged,
          value:
            attribute.value != null && attribute.value !== ''
              ? JSON.stringify(attribute.value)
              : '',
          value_t: attribute.value_type,
        })),
      })
    }
  }, [attrData, selectedUpdateTemplate])

  const showSpinner = useSpinDelay(attrLoading, {
    delay: 150,
    minDuration: 300,
  })

  const selectDropdownServiceRef = useRef<SelectInstance<SelectOption> | null>(
    null,
  )

  useEffect(() => {
    reset()
  }, [isOpen])

  return (
    <Sheet open={isOpen} onOpenChange={close} modal={false}>
      <SheetContent
        onInteractOutside={e => {
          e.preventDefault()
        }}
        className={cn('flex h-full max-w-xl flex-col justify-between')}
      >
        <SheetHeader>
          <SheetTitle>
            {t('cloud:device_template.add_template.update')}
          </SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
          {attrLoading ? (
            <div className="flex grow items-center justify-center">
              <Spinner showSpinner={showSpinner} size="xl" />
            </div>
          ) : (
            <Form {...form}>
              <form
                className="w-full space-y-5"
                id="update-template"
                onSubmit={handleSubmit(values => {
                  const data = {
                    name: values.name,
                    rule_chain_id: values.rule_chain_id || '',
                    attributes:
                      values.attributes && values.attributes.length > 0
                        ? values.attributes
                        : undefined,
                    thing_id: values.thing_id || '',
                    handle_msg_svc: values.handle_msg_svc || '',
                  }
                  mutate({
                    data,
                    templateId: selectedUpdateTemplate?.id,
                  })
                })}
              >
                <>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('cloud:device_template.add_template.name')}
                        </FormLabel>
                        <div>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t(
                                'cloud:org_manage.event_manage.add_event.input_placeholder',
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <div className="relative w-full">
                    <div className="w-[calc(100%-2.5rem)]">
                      <FormField
                        control={form.control}
                        name="thing_id"
                        render={({ field: { onChange, value, ...field } }) => (
                          <FormItem>
                            <FormLabel>
                              {t('cloud:custom_protocol.thing.id')}
                            </FormLabel>
                            <div>
                              <FormControl>
                                <NewSelectDropdown
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
                                  placeholder={t(
                                    'cloud:custom_protocol.thing.choose',
                                  )}
                                  isLoading={AdapterIsLoading}
                                  defaultValue={thingSelectData?.find(
                                    thing =>
                                      thing.value ===
                                      selectedUpdateTemplate.thing_id,
                                  )}
                                  handleClearSelectDropdown={() =>
                                    selectDropdownServiceRef.current?.clearValue()
                                  }
                                  handleChangeSelect={() =>
                                    selectDropdownServiceRef.current?.clearValue()
                                  }
                                  error={formState?.errors?.thing_id}
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
                      classNameTriggerBtn="h-[34px] absolute right-0 bottom-0"
                    />
                  </div>
                  {!isLoadingService ? (
                    <div className="relative w-full">
                      <div className="w-[calc(100%-2.5rem)]">
                        <FormField
                          control={form.control}
                          name="handle_msg_svc"
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
                                    refSelect={selectDropdownServiceRef}
                                    customOnChange={onChange}
                                    options={serviceSelectData}
                                    isOptionDisabled={option =>
                                      option.label ===
                                        t('loading:service_thing') ||
                                      option.label === t('table:no_service')
                                    }
                                    noOptionsMessage={() =>
                                      t('table:no_service')
                                    }
                                    loadingMessage={() =>
                                      t('loading:service_thing')
                                    }
                                    placeholder={t(
                                      'cloud:custom_protocol.service.choose',
                                    )}
                                    isLoading={isLoading}
                                    defaultValue={serviceSelectData?.find(
                                      service =>
                                        service.value ===
                                        selectedUpdateTemplate.handle_message_svc,
                                    )}
                                    error={formState?.errors?.handle_msg_svc}
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
                        classNameTriggerBtn="h-[34px] absolute right-0 bottom-0"
                      />
                    </div>
                  ) : null}
                  {fields.map((field, index) => (
                    <section
                      key={field.id}
                      className="mt-3 flex justify-between gap-3 rounded-md bg-slate-200 px-2 py-4"
                    >
                      <div className="grid w-full grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
                        <InputField
                          label={t('cloud:org_manage.org_manage.add_attr.name')}
                          error={
                            formState?.errors?.attributes?.[index]
                              ?.attribute_key
                          }
                          registration={register(
                            `attributes.${index}.attribute_key` as const,
                          )}
                          disabled
                        />
                        <SelectField
                          className="h-[36px] py-1"
                          label={t(
                            'cloud:org_manage.org_manage.add_attr.value_type',
                          )}
                          error={
                            formState?.errors?.attributes?.[index]?.value_t
                          }
                          registration={register(
                            `attributes.${index}.value_t` as const,
                          )}
                          options={valueTypeOptions}
                          disabled
                        />
                        {watch(`attributes.${index}.value_t`) === 'BOOL' ? (
                          <SelectField
                            className="h-[36px] py-1"
                            label={t(
                              'cloud:org_manage.org_manage.add_attr.value',
                            )}
                            error={
                              formState?.errors?.attributes?.[index]?.value
                            }
                            registration={register(
                              `attributes.${index}.value` as const,
                            )}
                            options={booleanSelectOption}
                            disabled
                          />
                        ) : (
                          <InputField
                            label={t(
                              'cloud:org_manage.org_manage.add_attr.value',
                            )}
                            error={
                              formState?.errors?.attributes?.[index]?.value
                            }
                            registration={register(
                              `attributes.${index}.value` as const,
                            )}
                            step={0.01}
                            type={
                              numberInput.includes(
                                watch(`attributes.${index}.value_t`),
                              )
                                ? 'number'
                                : 'text'
                            }
                            disabled
                          />
                        )}
                        <FieldWrapper
                          className="w-fit space-y-2"
                          label={t(
                            'cloud:org_manage.org_manage.add_attr.logged',
                          )}
                          error={formState?.errors?.attributes?.[index]?.logged}
                        >
                          <Controller
                            control={control}
                            name={`attributes.${index}.logged`}
                            render={({
                              field: { onChange, value, ...field },
                            }) => {
                              return (
                                <Checkbox
                                  {...field}
                                  checked={value}
                                  onCheckedChange={onChange}
                                  disabled
                                />
                              )
                            }}
                          />
                        </FieldWrapper>
                      </div>
                    </section>
                  ))}
                </>
              </form>
            </Form>
          )}
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
              form="update-template"
              type="submit"
              size="lg"
              isLoading={isLoading}
              disabled={!formState.isDirty || isLoading}
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
