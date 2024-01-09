import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useSpinDelay } from 'spin-delay'

import { useGetAttrs } from '~/cloud/orgManagement/api/attrAPI'
import { Button } from '~/components/Button'
import { Checkbox } from '~/components/Checkbox'
import { Drawer } from '~/components/Drawer'
import {
  FieldWrapper,
  InputField,
  SelectDropdown,
  SelectField,
  type SelectOption,
} from '~/components/Form'
import { Spinner } from '~/components/Spinner'
import { flattenData } from '~/utils/misc.ts'
import storage from '~/utils/storage'
import { useUpdateTemplate, type UpdateTemplateDTO } from '../api'
import { useGetRulechains } from '../api/getRulechains'
import { templateAttrSchema } from './CreateTemplate'
import { type SelectInstance } from 'react-select'
import {
  booleanSelectOption,
  numberInput,
  valueTypeList,
} from '~/cloud/orgManagement/components/Attributes'
import { type Attribute } from '~/types'
import { type Template } from '../types'

import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { useGetEntityThings } from '~/cloud/customProtocol/api/entityThing'
import { useGetServiceThings } from '~/cloud/customProtocol/api/serviceThing'
import { CreateThing } from '~/cloud/flowEngineV2/components/Attributes'
import { CreateService } from '~/cloud/customProtocol/components/CreateService'

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
  const projectId = storage.getProject()?.id
  const { data: ruchainsData, isLoading: RuleIsLoading } = useGetRulechains({
    projectId,
  })
  const valueTypeOptions = valueTypeList.map(valueType => ({
    label: valueType.name,
    value: valueType.type,
  }))
  const { acc: RuleFlattenData } = flattenData(ruchainsData?.data, [
    'id',
    'name',
  ])
  const RuleSelectOptions = RuleFlattenData?.map(ruchains => ({
    label: ruchains?.name,
    value: JSON.parse(ruchains?.id)?.id,
  }))

  const { data: attrData, isLoading: attrLoading } = useGetAttrs({
    entityType: 'TEMPLATE',
    entityId: selectedUpdateTemplate?.id,
    config: { suspense: false },
  })

  const { data: thingData, isLoading: AdapterIsLoading } = useGetEntityThings({
    projectId,
    type: 'thing',
  })
  const thingSelectData = thingData?.data?.list?.map(thing => ({
    value: thing?.id,
    label: thing?.name,
  }))

  const { register, formState, watch, handleSubmit,  reset, control, getValues } = useForm<
    UpdateTemplateDTO['data']
  >({
    resolver: templateAttrSchema && zodResolver(templateAttrSchema),
  })
  const { data: serviceData, isLoading: isLoadingService } =
  useGetServiceThings({
    thingId: getValues('thing_id') || selectedUpdateTemplate.thing_id,
    config: { enabled: !!getValues('thing_id'), suspense: false },
  })
  const serviceSelectData = serviceData?.data?.map(service => ({
    value: service?.name,
    label: service?.name,
  }))

  const { fields, append, remove } = useFieldArray({
    name: 'attributes',
    control,
  })

  const { mutate, isLoading, isSuccess } = useUpdateTemplate()

  const selectDropdownServiceRef = useRef<SelectInstance<SelectOption> | null>(
    null,
  )

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])
  useEffect(() => {
    if (attrData != null && selectedUpdateTemplate) {
      reset({
        name: selectedUpdateTemplate.name,
        rule_chain_id: selectedUpdateTemplate.rule_chain_id,
        thing_id: selectedUpdateTemplate.thing_id,
        handle_msg_svc: selectedUpdateTemplate.handle_message_svc,
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
  }, [attrData, selectedUpdateTemplate, AdapterIsLoading])

  const showSpinner = useSpinDelay(attrLoading, {
    delay: 150,
    minDuration: 300,
  })

  useEffect(() => {
    if (!isLoadingService && serviceSelectData && serviceSelectData.length > 0) {
      console.log(
        '11111111111111111111111111',
        serviceSelectData,
        serviceSelectData.find(
          (service) => service.value === selectedUpdateTemplate?.handle_message_svc
        )
      );
    }
  }, [isLoadingService, serviceSelectData, selectedUpdateTemplate]);
  console.log('selectedUpdateTemplate', selectedUpdateTemplate)
  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      title={t('cloud:device_template.add_template.update')}
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
            form="update-template"
            type="submit"
            size="lg"
            isLoading={isLoading}
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
            disabled={!formState.isDirty}
          />
        </>
      )}
    >
      {/* {attrLoading ? (
        <div className="flex grow items-center justify-center">
          <Spinner showSpinner={showSpinner} size="xl" />
        </div>
      ) : ( */}
        <form
          className="w-full space-y-5"
          id="update-template"
          onSubmit={handleSubmit(values => {
            const data = {
              name: values.name,
              rule_chain_id: values.rule_chain_id,
              attributes:
                values.attributes && values.attributes.length > 0
                  ? values.attributes
                  : undefined,
              thing_id: values.thing_id,
              handle_msg_svc: values.handle_msg_svc
            }
            // console.log('rule_chain_id', values.rule_chain_id)
            // console.log('thing_id', values.thing_id)
            // console.log('handle_msg_svc', values.handle_msg_svc)
            mutate({
              data,
              templateId: selectedUpdateTemplate?.id,
            })
          })}
        >
          <>
            <InputField
              label={t('cloud:device_template.add_template.name')}
              error={formState.errors['name']}
              registration={register('name')}
            />

            <SelectDropdown
              label={t('cloud:device_template.add_template.flow')}
              name="rule_chain_id"
              control={control}
              options={RuleSelectOptions}
              isOptionDisabled={option =>
                option.label === t('loading:flow_id') ||
                option.label === t('table:no_in_flow_id')
              }
              noOptionsMessage={() => t('table:no_in_flow_id')}
              loadingMessage={() => t('loading:flow_id')}
              isLoading={RuleIsLoading}
              placeholder={t(
                'cloud:device_template.add_template.choose_flow_id',
              )}
              defaultValue={RuleSelectOptions.find(
                ruchains =>
                  ruchains.value === selectedUpdateTemplate.rule_chain_id,
              )}
              error={formState?.errors?.rule_chain_id}
            />
            {/* {console.log('rule_chain_id:', selectedUpdateTemplate.rule_chain_id)} */}
            {!AdapterIsLoading ? (
              <div className="w-[calc(100%-2.5rem)]">
                <SelectDropdown
                  label={t('cloud:custom_protocol.thing.id')}
                  name="thing_id"
                  control={control}
                  options={thingSelectData}
                  isOptionDisabled={option =>
                    option.label === t('loading:entity_thing') ||
                    option.label === t('table:no_thing')
                  }
                  noOptionsMessage={() => t('table:no_thing')}
                  loadingMessage={() => t('loading:entity_thing')}
                  isLoading={AdapterIsLoading}
                  placeholder={t('cloud:custom_protocol.thing.choose')}
                  defaultValue={thingSelectData?.find(
                    thing => thing.value === selectedUpdateTemplate.thing_id,
                  )}
                  handleClearSelectDropdown={() =>
                    selectDropdownServiceRef.current?.clearValue()
                  }
                  handleChangeSelect={() =>
                    selectDropdownServiceRef.current?.clearValue()
                  }
                  error={formState?.errors?.thing_id}
                />
              </div>
            ) : null}
            {!isLoadingService && serviceSelectData ? (
              <div className="w-[calc(100%-2.5rem)]">
                <SelectDropdown
                  refSelect={selectDropdownServiceRef}
                  label={t('cloud:custom_protocol.service.title')}
                  name="handle_msg_svc"
                  control={control}
                  options={serviceSelectData}
                  isOptionDisabled={option =>
                    option.label === t('loading:service_thing') ||
                    option.label === t('table:no_service')
                  }
                  isLoading={isLoadingService}
                  noOptionsMessage={() => t('table:no_service')}
                  placeholder={t('cloud:custom_protocol.service.choose')}
                  defaultValue={serviceSelectData && serviceSelectData?.find(
                    service => service.value === selectedUpdateTemplate.handle_message_svc,
                  )}
                  error={formState?.errors?.handle_msg_svc}
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
                      formState?.errors?.attributes?.[index]?.attribute_key
                    }
                    registration={register(
                      `attributes.${index}.attribute_key` as const,
                    )}
                    disabled
                  />
                  <SelectField
                    className="h-[36px] py-1"
                    label={t('cloud:org_manage.org_manage.add_attr.value_type')}
                    error={formState?.errors?.attributes?.[index]?.value_t}
                    registration={register(
                      `attributes.${index}.value_t` as const,
                    )}
                    options={valueTypeOptions}
                    disabled
                  />
                  {watch(`attributes.${index}.value_t`) === 'BOOL' ? (
                    <SelectField
                      className="h-[36px] py-1"
                      label={t('cloud:org_manage.org_manage.add_attr.value')}
                      error={formState?.errors?.attributes?.[index]?.value}
                      registration={register(
                        `attributes.${index}.value` as const,
                      )}
                      options={booleanSelectOption}
                      disabled
                    />
                  ) : (
                    <InputField
                      label={t('cloud:org_manage.org_manage.add_attr.value')}
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
                      disabled
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
                      render={({ field: { onChange, value, ...field } }) => {
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
      {/* )} */}
      <CreateThing
        thingType="thing"
        classNameTriggerBtn="absolute right-0 top-[183px] mr-6"
      />
      <CreateService
        thingId={watch('thing_id')}
        classNameTriggerBtn="absolute right-0 top-[262px] mr-6"
      />
    </Drawer>
    )
}
