import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { useSpinDelay } from 'spin-delay'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '~/components/Button'
import {
  FieldWrapper,
  InputField,
  SelectField,
  SelectDropdown,
} from '~/components/Form'
import { Drawer } from '~/components/Drawer'
import { Spinner } from '~/components/Spinner'
import { type UpdateTemplateDTO, useUpdateTemplate } from '../api'
import { useGetAttrs } from '~/cloud/orgManagement/api/attrAPI'
import { templateAttrSchema } from './CreateTemplate'
import { Checkbox } from '~/components/Checkbox'
import storage from '~/utils/storage'
import { useGetRulechains } from '../api/getRulechains'
import { flattenData } from '~/utils/misc.ts'

import { type Template } from '../types'
import { type Attribute } from '~/types'
import {
  booleanSelectOption,
  numberInput,
  valueTypeList,
} from '~/cloud/orgManagement/components/Attributes'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'

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

  const { register, formState, watch, handleSubmit,  reset, control } = useForm<
    UpdateTemplateDTO['data']
  >({
    resolver: templateAttrSchema && zodResolver(templateAttrSchema),
  })
  useEffect(() => {
    if (attrData != null) {
      reset({
          name: selectedUpdateTemplate?.name,
          rule_chain_id: selectedUpdateTemplate?.rule_chain_id,
          attributes:
            attrData?.attributes.map((attribute: Attribute) => ({
              attribute_key: attribute.attribute_key,
              logged: attribute.logged,
              value: attribute.value.toString(),
              value_t: attribute.value_type,
            })),
        })
    }
  }, [attrData])

  const { fields, append, remove } = useFieldArray({
    name: 'attributes',
    control,
  })

  const { mutate, isLoading, isSuccess } = useUpdateTemplate()

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  useEffect(() => {
    if (attrData != null) {
      reset({
        name: selectedUpdateTemplate?.name,
        rule_chain_id: selectedUpdateTemplate?.rule_chain_id,
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
      {attrLoading ? (
        <div className="flex grow items-center justify-center">
          <Spinner showSpinner={showSpinner} size="xl" />
        </div>
      ) : (
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
            }
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
            <div className="space-y-1">
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
              />
              <p className="text-body-sm text-primary-400">
                {formState?.errors?.rule_chain_id?.message}
              </p>
            </div>
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
      )}
    </Drawer>
  )
}
