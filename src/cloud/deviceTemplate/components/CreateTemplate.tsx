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
import storage from '@/utils/storage'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { type SelectInstance } from 'react-select'
import * as z from 'zod'
import {
  useCreateTemplate,
  useUpdateTemplate,
  type CreateTemplateDTO,
} from '../api'

import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { useGetEntityThings } from '@/cloud/customProtocol/api/entityThing'
import { useGetServiceThings } from '@/cloud/customProtocol/api/serviceThing'
import { CreateService } from '@/cloud/customProtocol/components/CreateService'
import { CreateThing } from '@/cloud/flowEngineV2/components/Attributes'
import { NewSelectDropdown } from '@/components/Form/NewSelectDropdown'
import { PlusIcon } from '@/components/SVGIcons'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/utils/misc'
import { attrSchema, nameSchema } from '@/utils/schemaValidation'

export const templateAttrSchema = z.object({
  name: nameSchema,
  rule_chain_id: z.string().optional(),
  attributes: z.array(attrSchema),
  thing_id: z.string().optional(),
  handle_msg_svc: z.string().optional(),
})

type CreateTemplateProps = {
  open?: () => void
  close?: () => void
  isOpen?: boolean
  protocol?: string
}

export default function CreateTemplate({
  open,
  close,
  isOpen,
  protocol,
}: CreateTemplateProps) {
  const { t } = useTranslation()
  const projectId = storage.getProject()?.id
  const valueTypeOptions = valueTypeList.map(valueType => ({
    label: valueType.name,
    value: valueType.type,
  }))

  const {
    mutateAsync: mutateAsyncCreateTemplate,
    isLoading: isLoadingCreateTemplate,
    isSuccess: isSuccessCreateTemplate,
  } = useCreateTemplate()

  const { data: thingData, isLoading: AdapterIsLoading } = useGetEntityThings({
    projectId,
    type: 'thing',
  })

  const thingSelectData = thingData?.data?.list?.map(thing => ({
    value: thing.id,
    label: thing.name,
  }))

  const form = useForm<CreateTemplateDTO['data']>({
    resolver: templateAttrSchema && zodResolver(templateAttrSchema),
    defaultValues: {
      name: '',
      rule_chain_id: '',
      attributes: [{ attribute_key: '', value: '', logged: true, value_t: '' }],
    },
  })

  const {
    register,
    formState,
    watch,
    handleSubmit,
    getValues,
    control,
    reset,
  } = form

  const { fields, append, remove } = useFieldArray({
    name: 'attributes',
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
  const { mutate: mutateUpdateTemplate } = useUpdateTemplate({
    isOnCreateTemplate: true,
  })

  const selectDropdownServiceRef = useRef<SelectInstance<SelectOption> | null>(
    null,
  )

  useEffect(() => {
    if (isSuccessCreateTemplate && close) {
      close()
    }
  }, [isSuccessCreateTemplate])

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
            {t('cloud:device_template.add_template.title')}
          </SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
          <Form {...form}>
            <form
              className="w-full space-y-5"
              id="create-template"
              onSubmit={handleSubmit(async values => {
                const dataCreateTemplate = await mutateAsyncCreateTemplate({
                  data: {
                    project_id: projectId,
                    rule_chain_id: values.rule_chain_id,
                    name: values.name,
                    attributes: values.attributes,
                    thing_id: values.thing_id,
                    handle_msg_svc: values.handle_msg_svc,
                    transport_config: {
                      protocol: protocol ?? '',
                    },
                  },
                })
                mutateUpdateTemplate({
                  data: {
                    name: dataCreateTemplate.name,
                    rule_chain_id: dataCreateTemplate.rule_chain_id,
                    attributes: dataCreateTemplate.attributes,
                    thing_id: dataCreateTemplate.thing_id,
                    handle_msg_svc: dataCreateTemplate.handle_message_svc,
                  },
                  templateId: dataCreateTemplate.id,
                })
              })}
            >
              <>
                <Button
                  className="h-9 w-9 rounded-md"
                  variant="trans"
                  size="square"
                  startIcon={
                    <PlusIcon width={16} height={16} viewBox="0 0 16 16" />
                  }
                  onClick={() =>
                    append({
                      attribute_key: '',
                      value: '',
                      logged: true,
                      value_t: '',
                    })
                  }
                />
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
                                isClearable={true}
                                isOptionDisabled={option =>
                                  option.label === t('loading:entity_thing') ||
                                  option.label === t('table:no_thing')
                                }
                                noOptionsMessage={() => t('table:no_thing')}
                                loadingMessage={() => t('loading:entity_thing')}
                                placeholder={t(
                                  'cloud:custom_protocol.thing.choose',
                                )}
                                handleClearSelectDropdown={() =>
                                  selectDropdownServiceRef.current?.clearValue()
                                }
                                handleChangeSelect={() =>
                                  selectDropdownServiceRef.current?.clearValue()
                                }
                                isLoading={AdapterIsLoading}
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

                {/* {!isLoadingService ? ( */}
                <div className="relative w-full">
                  <div className="w-[calc(100%-2.5rem)]">
                    <FormField
                      control={form.control}
                      name="handle_msg_svc"
                      render={({ field: { onChange, value, ...field } }) => (
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
                                  option.label === t('loading:service_thing') ||
                                  option.label === t('table:no_service')
                                }
                                noOptionsMessage={() => t('table:no_service')}
                                loadingMessage={() =>
                                  t('loading:service_thing')
                                }
                                placeholder={t(
                                  'cloud:custom_protocol.service.choose',
                                )}
                                isLoading={
                                  watch('thing_id') != null
                                    ? isLoadingService
                                    : false
                                }
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
                {/* ) : null} */}
                {fields.map((field, index) => (
                  <section
                    key={field.id}
                    className="mt-3 flex justify-between gap-3 rounded-md bg-slate-200 px-2 py-4"
                  >
                    <div className="grid w-full grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
                      <InputField
                        label={t('cloud:org_manage.org_manage.add_attr.name')}
                        error={
                          formState?.errors?.attributes?.[index]?.attribute_key
                        }
                        registration={register(
                          `attributes.${index}.attribute_key` as const,
                        )}
                      />
                      <SelectField
                        className="h-[36px] py-1"
                        label={t(
                          'cloud:org_manage.org_manage.add_attr.value_type',
                        )}
                        error={formState?.errors?.attributes?.[index]?.value_t}
                        registration={register(
                          `attributes.${index}.value_t` as const,
                        )}
                        options={valueTypeOptions}
                      />
                      {watch(`attributes.${index}.value_t`) === 'BOOL' ? (
                        <SelectField
                          className="h-[36px] py-1"
                          label={t(
                            'cloud:org_manage.org_manage.add_attr.value',
                          )}
                          error={formState?.errors?.attributes?.[index]?.value}
                          registration={register(
                            `attributes.${index}.value` as const,
                          )}
                          options={booleanSelectOption}
                        />
                      ) : (
                        <InputField
                          label={t(
                            'cloud:org_manage.org_manage.add_attr.value',
                          )}
                          error={formState?.errors?.attributes?.[index]?.value}
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
                        />
                      )}
                      <FieldWrapper
                        className="w-fit space-y-2"
                        label={t('cloud:org_manage.org_manage.add_attr.logged')}
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
                              />
                            )
                          }}
                        />
                      </FieldWrapper>
                    </div>
                    <Button
                      type="button"
                      size="square"
                      variant="trans"
                      className="mt-3 border-none"
                      onClick={() => remove(index)}
                      startIcon={
                        <img
                          src={btnDeleteIcon}
                          alt="Delete device template"
                          className="h-8 w-8"
                        />
                      }
                    />
                  </section>
                ))}
              </>
            </form>
          </Form>
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
              form="create-template"
              type="submit"
              size="lg"
              isLoading={isLoadingCreateTemplate}
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
