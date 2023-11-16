import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { Controller } from 'react-hook-form'

import { Button } from '~/components/Button'
import { FieldWrapper, Form, InputField, SelectField } from '~/components/Form'
import { valueTypeList } from './CreateAttr'
import { Drawer } from '~/components/Drawer'
import {
  type UpdateAttrDTO,
  type EntityType,
  useUpdateAttr,
} from '../../api/attrAPI'
import { Checkbox } from '~/components/Checkbox'
import { useUpdateLogged } from '../../api/attrAPI/updateLogged'

import { type Attribute } from '~/types'
import { attrSchema } from '~/utils/schemaValidation'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'

type UpdateAttrProps = {
  entityId: string
  entityType: EntityType
  attributeKey: string
  value: string | number | boolean
  value_type: Attribute['value_type']
  logged: boolean
  close: () => void
  isOpen: boolean
}

export function UpdateAttr({
  entityId,
  entityType,
  attributeKey,
  value,
  value_type,
  logged,
  close,
  isOpen,
}: UpdateAttrProps) {
  const { t } = useTranslation()

  const { mutate: mutateUpdateLogged } = useUpdateLogged({}, false)
  const { mutate, isLoading, isSuccess } = useUpdateAttr()
  let CheckboxState = value === 'true'
  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

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
      <Form<UpdateAttrDTO['data']['attributes'][0], typeof attrSchema>
        id="update-attr"
        onSubmit={values => {
          mutateUpdateLogged({
            data: {
              logged: CheckboxState,
            },
            device_id: entityId,
            attribute_key: attributeKey,
            entityType: entityType,
          })
          mutate({
            data: {
              attributes: [
                {
                  attribute_key: attributeKey,
                  logged: values.logged,
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
            attribute_key: attributeKey,
            logged: String(logged) === 'true',
            value: value.toString(),
            value_t: value_type,
          },
        }}
        schema={attrSchema}
      >
        {({ register, formState, control }) => {
          // console.log('formState errors: ', formState.errors)

          return (
            <>
              <section className="mt-3 flex justify-between gap-3 rounded-md bg-slate-200 px-2 py-4">
                <div className="grid w-full grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
                  <SelectField
                    label={t('cloud:org_manage.org_manage.add_attr.value_type')}
                    error={formState.errors['value_t']}
                    registration={register('value_t')}
                    options={valueTypeList.map(valueType => ({
                      label: valueType.name,
                      value: valueType.type,
                    }))}
                  />
                  <InputField
                    label={t('cloud:org_manage.org_manage.add_attr.value')}
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
                              CheckboxState = !value
                            }}
                          />
                        )
                      }}
                    />
                  </FieldWrapper>
                </div>
              </section>
            </>
          )
        }}
      </Form>
    </Drawer>
  )
}
