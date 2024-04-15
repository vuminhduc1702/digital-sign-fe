import { zodResolver } from '@hookform/resolvers/zod'
import { useRef } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { type SelectInstance } from 'react-select'
import * as z from 'zod'
import {
  booleanSelectOption,
  numberInput,
  valueTypeList,
} from '~/cloud/orgManagement/components/Attributes'
import { Button } from '~/components/Button'
import { Checkbox } from '~/components/Checkbox'
import {
  FieldWrapper,
  FormDrawer,
  InputField,
  SelectDropdown,
  SelectField,
  type SelectOption,
} from '~/components/Form'
import storage from '~/utils/storage'
import {
  useCreateTemplate,
  type CreateTemplateDTO,
  useUpdateTemplate,
} from '../api'
import { useGetRulechains } from '../api/getRulechains'

import { attrSchema, nameSchema } from '~/utils/schemaValidation'

import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { useGetEntityThings } from '~/cloud/customProtocol/api/entityThing'
import { useGetServiceThings } from '~/cloud/customProtocol/api/serviceThing'
import { CreateService } from '~/cloud/customProtocol/components/CreateService'
import { CreateThing } from '~/cloud/flowEngineV2/components/Attributes'
import { PlusIcon } from '~/components/SVGIcons'

export const templateAttrSchema = z.object({
  name: nameSchema,
  rule_chain_id: z.string().optional(),
  attributes: z.array(attrSchema),
  thing_id: z.string().optional(),
  handle_msg_svc: z.string().optional(),
})

export default function CreateTemplate() {
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

  // const { data: ruchainsData, isLoading: isLoadingRuchains } = useGetRulechains(
  //   { projectId },
  // )

  const { data: thingData, isLoading: AdapterIsLoading } = useGetEntityThings({
    projectId,
    type: 'thing',
  })

  const thingSelectData = thingData?.data?.list?.map(thing => ({
    value: thing.id,
    label: thing.name,
  }))

  const {
    register,
    formState,
    watch,
    handleSubmit,
    getValues,
    control,
    reset,
  } = useForm<CreateTemplateDTO['data']>({
    resolver: templateAttrSchema && zodResolver(templateAttrSchema),
    defaultValues: {
      name: '',
      rule_chain_id: '',
      attributes: [{ attribute_key: '', value: '', logged: true, value_t: '' }],
    },
  })
  const { fields, append, remove } = useFieldArray({
    name: 'attributes',
    control,
  })

  // const RuleSelectOptions = ruchainsData?.data?.map(ruchains => ({
  //   label: ruchains?.name,
  //   value: ruchains?.id?.id,
  // }))
  const { data: serviceData, isLoading: isLoadingService } =
    useGetServiceThings({
      thingId: getValues('thing_id'),
      config: {
        enabled: !!getValues('thing_id'),
        suspense: false,
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
  return (
    <FormDrawer
      isDone={isSuccessCreateTemplate}
      resetData={() => reset()}
      triggerButton={
        <Button
          className="h-9 w-9 rounded-md"
          variant="trans"
          size="square"
          startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
      }
      title={t('cloud:device_template.add_template.title')}
      submitButton={
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
      }
    >
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
            startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
            onClick={() =>
              append({
                attribute_key: '',
                value: '',
                logged: true,
                value_t: '',
              })
            }
          />
          <InputField
            label={t('cloud:device_template.add_template.name')}
            error={formState.errors['name']}
            registration={register('name')}
          />

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
              handleClearSelectDropdown={() =>
                selectDropdownServiceRef.current?.clearValue()
              }
              handleChangeSelect={() =>
                selectDropdownServiceRef.current?.clearValue()
              }
              error={formState?.errors?.thing_id}
            />
          </div>

          {/* {!isLoadingService ? ( */}
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
              isLoading={watch('thing_id') != null ? isLoadingService : false}
              loadingMessage={() => t('loading:service_thing')}
              noOptionsMessage={() => t('table:no_service')}
              placeholder={t('cloud:custom_protocol.service.choose')}
              error={formState?.errors?.handle_msg_svc}
            />
          </div>
          {/* ) : null} */}

          {/* <SelectDropdown
            isClearable={true}
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
            isLoading={isLoadingRuchains}
            placeholder={t('cloud:device_template.add_template.choose_flow_id')}
            error={formState?.errors?.rule_chain_id}
          /> */}
          {fields.map((field, index) => (
            <section
              key={field.id}
              className="mt-3 flex justify-between gap-3 rounded-md bg-slate-200 px-2 py-4"
            >
              <div className="grid w-full grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
                <InputField
                  label={t('cloud:org_manage.org_manage.add_attr.name')}
                  error={formState?.errors?.attributes?.[index]?.attribute_key}
                  registration={register(
                    `attributes.${index}.attribute_key` as const,
                  )}
                />
                <SelectField
                  className="h-[36px] py-1"
                  label={t('cloud:org_manage.org_manage.add_attr.value_type')}
                  error={formState?.errors?.attributes?.[index]?.value_t}
                  registration={register(
                    `attributes.${index}.value_t` as const,
                  )}
                  options={valueTypeOptions}
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
                      numberInput.includes(watch(`attributes.${index}.value_t`))
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
                    render={({ field: { onChange, value, ...field } }) => {
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
      <CreateThing
        thingType="thing"
        classNameTriggerBtn="absolute right-0 top-[158px] mr-6"
      />
      <CreateService
        thingId={watch('thing_id')}
        classNameTriggerBtn="absolute right-0 top-[238px] mr-6"
      />
    </FormDrawer>
  )
}
