import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { useSpinDelay } from 'spin-delay'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '~/components/Button'
import { FieldWrapper, InputField, SelectField } from '~/components/Form'
import { Drawer } from '~/components/Drawer'
import { Spinner } from '~/components/Spinner'
import { type UpdateTemplateDTO, useUpdateTemplate } from '../api'
import { useGetAttrs } from '~/cloud/orgManagement/api/attrAPI'
import { valueTypeList } from '~/cloud/orgManagement/components/Attributes'
import { templateAttrSchema } from './CreateTemplate'
import { Checkbox } from '~/components/Checkbox'

import { type Template } from '../types'
import { type Attribute } from '~/types'

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

  const { data: attrData, isLoading: attrLoading } = useGetAttrs({
    entityType: 'TEMPLATE',
    entityId: selectedUpdateTemplate?.id,
    config: { suspense: false },
  })

  const { register, formState, handleSubmit, control } = useForm<
    UpdateTemplateDTO['data']
  >({
    resolver: templateAttrSchema && zodResolver(templateAttrSchema),
    defaultValues: {
      name: selectedUpdateTemplate?.name,
      attributes:
        attrData?.attributes.map((attribute: Attribute) => ({
          attribute_key: attribute.attribute_key,
          logged: attribute.logged,
          value: attribute.value.toString(),
          value_t: attribute.value_type,
        })) || [],
    },
  })

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

  const showSpinner = useSpinDelay(attrLoading, {
    delay: 150,
    minDuration: 300,
  })

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      title={t('cloud:org_manage.org_manage.add_attr.edit')}
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
                    options={valueTypeList.map(valueType => ({
                      label: valueType.name,
                      value: valueType.type,
                    }))}
                  />
                  <InputField
                    classnamefieldwrapper="mt-2"
                    label={t('cloud:org_manage.org_manage.add_attr.value')}
                    error={formState?.errors?.attributes?.[index]?.value}
                    registration={register(
                      `attributes.${index}.value` as const,
                    )}
                  />
                  <FieldWrapper
                    className="mt-2 w-fit space-y-2"
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
                  className="mt-10 self-start border-none"
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
      )}
    </Drawer>
  )
}
