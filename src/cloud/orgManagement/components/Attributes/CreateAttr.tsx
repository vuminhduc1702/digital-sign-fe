import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '~/components/Button'
import {
  FieldWrapper,
  FormDrawer,
  InputField,
  SelectField,
} from '~/components/Form'
import {
  type CreateAttrDTO,
  useCreateAttr,
  type EntityType,
} from '~/cloud/orgManagement/api/attrAPI'
import { Checkbox } from '~/components/Checkbox'
import TitleBar from '~/components/Head/TitleBar'

import { type Attribute } from '~/types'
import { attrListSchema } from '~/utils/schemaValidation'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'

type ValueType = {
  type: Attribute['value_type']
  name: string
}

type CreateAttrProps = {
  entityId: string
  entityType: EntityType
}

export const attrListCreateSchema = z.object({
  entity_id: z.string(),
  attributes: attrListSchema,
})

export const valueTypeList: ValueType[] = [
  { type: 'STR', name: 'String' },
  { type: 'BOOL', name: 'Boolean' },
  { type: 'LONG', name: 'Long' },
  { type: 'DBL', name: 'Double' },
  { type: 'JSON', name: 'JSON' },
]

export const loggedList = [
  { type: false, name: 'Không' },
  { type: true, name: 'Có' },
]

export function CreateAttr({ entityId, entityType }: CreateAttrProps) {
  const { t } = useTranslation()

  const { mutate, isLoading, isSuccess } = useCreateAttr()

  const { register, formState, control, handleSubmit, reset } = useForm<
    CreateAttrDTO['data']
  >({
    resolver: attrListCreateSchema && zodResolver(attrListCreateSchema),
    defaultValues: {
      entity_id: entityId,
      entity_type: entityType,
      attributes: [{ attribute_key: '', value: '', logged: true, value_t: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    name: 'attributes',
    control,
  })

  return (
    <FormDrawer
      isDone={isSuccess}
      resetData={() => reset()}
      triggerButton={
        <Button
          className="h-9 w-9 rounded-md"
          variant="trans"
          size="square"
          startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
      }
      title={t('cloud:org_manage.org_manage.add_attr.title')}
      submitButton={
        <Button
          className="rounded border-none"
          form="create-attr"
          type="submit"
          size="lg"
          isLoading={isLoading}
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    >
      <form
        id="create-attr"
        className="w-full space-y-5"
        onSubmit={handleSubmit(values => {
          mutate({
            data: {
              entity_id: entityId,
              entity_type: entityType,
              attributes: [...values.attributes],
            },
          })
        })}
      >
        <>
          <div className="flex justify-between space-x-3">
            <TitleBar
              title={t('cloud:org_manage.org_manage.attr_list')}
              className="w-full rounded-md bg-secondary-700 pl-3"
            />
            <Button
              className="rounded-md"
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
          </div>
          {fields.map((field, index) => (
            <section
              className="mt-3 flex justify-between rounded-md bg-slate-200 px-2 py-4"
              key={field.id}
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
                  options={valueTypeList.map(valueType => ({
                    label: valueType.name,
                    value: valueType.type,
                  }))}
                />
                <InputField
                  label={t('cloud:org_manage.org_manage.add_attr.value')}
                  error={formState?.errors?.attributes?.[index]?.value}
                  registration={register(`attributes.${index}.value` as const)}
                />
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
    </FormDrawer>
  )
}
