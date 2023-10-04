import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { useSpinDelay } from 'spin-delay'

import { Button } from '~/components/Button'
import { FieldWrapper, Form, InputField, SelectField } from '~/components/Form'
import { attrListSchema, valueTypeList } from './CreateAttr'
import { Drawer } from '~/components/Drawer'
import { Spinner } from '~/components/Spinner'
import {
  type UpdateAttrDTO,
  type EntityType,
  useUpdateAttr,
  useGetAttrs,
} from '../../api/attrAPI'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import { Controller } from 'react-hook-form'
import { Checkbox } from '~/components/Checkbox'
import { useUpdateLogged } from '../../api/attrAPI/updateLogged'

type UpdateAttrProps = {
  entityId: string
  entityType: EntityType
  attributeKey: string
  close: () => void
  isOpen: boolean
}

export function UpdateAttr({
  entityId,
  entityType,
  attributeKey,
  close,
  isOpen,
}: UpdateAttrProps) {
  const { t } = useTranslation()

  const { mutate: mutateUpdateLogged } = useUpdateLogged()
  const { mutate, isLoading, isSuccess } = useUpdateAttr()

  const { data: attrData, isLoading: attrLoading } = useGetAttrs({
    entityType,
    entityId,
    key: attributeKey,
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
      title={t('cloud:org_manage.org_manage.add_attr.edit_full')}
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
            form="update-attr"
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
        <Form<UpdateAttrDTO['data']['attributes'][0]>
          id="update-attr"
          onSubmit={values => {
            mutate({
              data: {
                attributes: [
                  {
                    attribute_key: values.attribute_key,
                    logged: String(values.logged).toLowerCase() === 'true',
                    value: values.value,
                    value_t: values.value_t,
                  },
                ],
              },
              entityType,
              entityId,
            })
          }}
          options={{
            defaultValues: {
              attribute_key: attrData?.attributes[0].attribute_key,
              logged: attrData?.attributes[0].logged,
              value: attrData?.attributes[0].value.toString(),
              value_t: attrData?.attributes[0].value_type,
            },
          }}
        >
          {({ register, formState, control }) => (
            <>
              <section className="mt-3 flex justify-between gap-3 rounded-md bg-slate-200 px-2 py-4">
                <div className="grid w-full grid-cols-1 gap-x-4 md:grid-cols-2">
                  <SelectField
                    label={
                      t('cloud:org_manage.org_manage.add_attr.value_type') ??
                      "Attribute's value type"
                    }
                    error={formState.errors['value_t']}
                    registration={register('value_t')}
                    options={valueTypeList.map(valueType => ({
                      label: valueType.name,
                      value: valueType.type,
                    }))}
                  />
                  <InputField
                    label={
                      t('cloud:org_manage.org_manage.add_attr.value') ?? 'Value'
                    }
                    error={formState.errors['value']}
                    registration={register('value')}
                  />
                  <FieldWrapper
                    className="mt-2 space-y-2"
                    label={t('cloud:org_manage.org_manage.add_attr.logged')}
                    error={formState.errors['logged']}
                  >
                    <Controller
                      control={control}
                      name={'logged'}
                      render={({ field: { onChange, value, ...field } }) => {
                        return (
                          <Checkbox
                            {...field}
                            checked={value}
                            onCheckedChange={onChange}
                            onClick={() => {
                              mutateUpdateLogged({
                                data: {
                                  logged: !value,
                                },
                                device_id: entityId,
                                attribute_type:
                                  attrData?.attributes[0].attribute_type,
                                attribute_key:
                                  attrData?.attributes[0].attribute_key,
                                entityType: entityType,
                              })
                            }}
                          />
                        )
                      }}
                    />
                  </FieldWrapper>
                </div>
              </section>
            </>
          )}
        </Form>
      )}
    </Drawer>
  )
}