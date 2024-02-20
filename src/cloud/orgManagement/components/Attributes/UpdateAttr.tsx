import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { Controller } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type * as z from 'zod'

import { Button } from '~/components/Button'
import { FieldWrapper, InputField, SelectField } from '~/components/Form'
import { booleanSelectOption, numberInput, valueTypeList } from './CreateAttr'
import { Drawer } from '~/components/Drawer'
import { type EntityType, useUpdateAttr } from '../../api/attrAPI'
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
  value: string
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

  const { mutateAsync: mutateAsyncUpdateLogged } = useUpdateLogged({}, false)
  const { mutate, isLoading, isSuccess } = useUpdateAttr()

  const { register, formState, control, handleSubmit, watch, reset } = useForm<
    z.infer<typeof attrSchema>
  >({
    resolver: attrSchema && zodResolver(attrSchema),
    defaultValues: {
      attribute_key: attributeKey,
      logged: String(logged) === 'true',
      value: value !== 'null' && value !== '' ? JSON.parse(JSON.stringify(value)) : '',
      value_t: value_type,
    },
  })

  useEffect(
    () =>
      reset({
        attribute_key: attributeKey,
        logged: String(logged) === 'true',
        value: value !== 'null' && value !== '' ? value : '',
        value_t: value_type,
      }),
    [],
  )

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
            disabled={!formState.isDirty || isLoading}
          />
        </>
      )}
    >
      <form
        id="update-attr"
        className="w-full space-y-6"
        onSubmit={handleSubmit(async values => {
          await mutateAsyncUpdateLogged({
            data: {
              logged: values.logged,
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
        })}
      >
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
              {watch(`value_t`) === 'BOOL' ? (
                <SelectField
                  className="h-[36px] py-1"
                  label={t('cloud:org_manage.org_manage.add_attr.value')}
                  error={formState?.errors?.value}
                  registration={register(`value` as const)}
                  options={booleanSelectOption}
                />
              ) : (
                <InputField
                  label={t('cloud:org_manage.org_manage.add_attr.value')}
                  error={formState?.errors?.value}
                  registration={register(`value` as const)}
                  step={0.000001}
                  type={
                    numberInput.includes(watch(`value_t`)) ? 'number' : 'text'
                  }
                />
              )}
              <FieldWrapper
                className="w-fit space-y-2"
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
                      />
                    )
                  }}
                />
              </FieldWrapper>
            </div>
          </section>
        </>
      </form>
    </Drawer>
  )
}
