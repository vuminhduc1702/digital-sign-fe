import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { useSpinDelay } from 'spin-delay'

import { Button } from '~/components/Button'
import { FormMultipleFields, InputField, SelectField } from '~/components/Form'
import { Drawer } from '~/components/Drawer'
import { Spinner } from '~/components/Spinner'
import { type UpdateTemplateDTO, useUpdateTemplate } from '../api'
import { useGetAttrs } from '~/cloud/orgManagement/api/attrAPI'
import {
  loggedList,
  valueTypeList,
} from '~/cloud/orgManagement/components/Attributes'
import { templateAttrSchema } from './CreateTemplate'

import { type Template } from '../types'
import { type Attribute } from '~/types'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'

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

  const { data: attrData, isLoading: attrLoading } = useGetAttrs({
    entityType: 'TEMPLATE',
    entityId: selectedUpdateTemplate?.id,
    config: { suspense: false },
  })

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
          />
        </>
      )}
    >
      {attrLoading ? (
        <div className="flex grow items-center justify-center">
          <Spinner showSpinner={showSpinner} size="xl" />
        </div>
      ) : (
        <FormMultipleFields<
          UpdateTemplateDTO['data'],
          typeof templateAttrSchema
        >
          id="update-template"
          onSubmit={values => {
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
          }}
          schema={templateAttrSchema}
          options={{
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
          }}
          name="attributes"
        >
          {(register, formState, fields, append, remove) => (
            <>
              <button
                type="button"
                onClick={() =>
                  append({
                    attribute_key: '',
                    value: '',
                    logged: true,
                    value_t: '',
                  })
                }
              >
                APPEND
              </button>
              <InputField
                label={t('cloud:device_template.add_template.name') ?? 'Name'}
                error={formState.errors['name']}
                registration={register('name')}
              />
              {fields.map((field, index) => (
                <section className="space-y-2" key={field.id}>
                  <InputField
                    label={
                      t('cloud:org_manage.org_manage.add_attr.name') ?? 'Name'
                    }
                    error={
                      formState.errors[`attributes.${index}.attribute_key`]
                    }
                    registration={register(
                      `attributes.${index}.attribute_key` as const,
                    )}
                    disabled
                  />
                  <SelectField
                    label={
                      t('cloud:org_manage.org_manage.add_attr.value_type') ??
                      'Value type'
                    }
                    error={formState.errors[`attributes.${index}.value_t`]}
                    registration={register(
                      `attributes.${index}.value_t` as const,
                    )}
                    options={valueTypeList.map(valueType => ({
                      label: valueType.name,
                      value: valueType.type,
                    }))}
                  />
                  <InputField
                    label={
                      t('cloud:org_manage.org_manage.add_attr.value') ?? 'Value'
                    }
                    error={formState.errors[`attributes.${index}.value`]}
                    registration={register(
                      `attributes.${index}.value` as const,
                    )}
                  />
                  <SelectField
                    label={
                      t('cloud:org_manage.org_manage.add_attr.logged') ??
                      'Logged'
                    }
                    error={formState.errors[`attributes.${index}.logged`]}
                    registration={register(
                      `attributes.${index}.logged` as const,
                    )}
                    options={loggedList.map(logged => ({
                      label: logged.name,
                      value: logged.type,
                    }))}
                  />
                  <button type="button" onClick={() => remove(index)}>
                    X
                  </button>
                </section>
              ))}
            </>
          )}
        </FormMultipleFields>
      )}
    </Drawer>
  )
}
