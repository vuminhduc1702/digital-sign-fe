import { useTranslation } from 'react-i18next'

import { Button } from '~/components/Button'
import { FormDrawer, FormMultipleFields, InputField, SelectField } from '~/components/Form'
import {
  type CreateAttrDTO,
  useCreateAttr,
  type EntityType,
} from '~/cloud/orgManagement/api/attrAPI'

import { type Attribute } from '~/types'
import { attrSchema } from '~/utils/schemaValidation'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import TitleBar from '~/components/Head/TitleBar'

type ValueType = {
  type: Attribute['value_type']
  name: string
}

type CreateAttrProps = {
  entityId: string
  entityType: EntityType
}

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

  // TODO: Choose bool valueType then InputField switch to Listbox

  return (
    <FormDrawer
      isDone={isSuccess}
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
      <FormMultipleFields<CreateAttrDTO['data'], typeof attrSchema>
        id="create-attr"
        onSubmit={values => {
          console.log(values)
          mutate({
            data: {
              entity_id: entityId,
              entity_type: entityType,
              attributes: [...values.attributes],
            },
          })
        }}
        options={{
          defaultValues: {
            entity_id: entityId,
            entity_type: entityType,
            attributes: [
              { attribute_key: '', value: '', logged: true, value_t: '' },
            ],
          },
        }}
        schema={attrSchema}
        name={['attributes']}
      >
        {({ register, formState }, { fields, append, remove }) => (
          <>
          <div className="flex justify-between space-x-3">
              <TitleBar
                title={t('cloud:org_manage.org_manage.attr_list')}
                className="w-full rounded-md bg-gray-500 pl-3"
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
                className="flex justify-between rounded-md bg-slate-200 px-2 py-4"
                style={{ marginTop: 10 }}
                key={field.id}
              >
                <div className="grid w-full grid-cols-1 gap-x-4 md:grid-cols-2">
                  <InputField
                    label={
                      t('cloud:org_manage.org_manage.add_attr.name') ?? 'Name'
                    }
                    error={formState?.errors?.attributes?.[index]?.attribute_key}
                    registration={register(`attributes.${index}.attribute_key` as const)}
                  />
                  <SelectField
                    label={
                      t('cloud:org_manage.org_manage.add_attr.value_type') ??
                      'Value type'
                    }
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
                    label={
                      t('cloud:org_manage.org_manage.add_attr.value') ?? 'Value'
                    }
                    error={formState?.errors?.attributes?.[index]?.value}
                    registration={register(
                      `attributes.${index}.value` as const,
                    )}
                  />
                  <SelectField
                    label={
                      t('cloud:org_manage.org_manage.add_attr.logged') ??
                      'Logged'
                    }
                    error={formState?.errors?.attributes?.[index]?.logged}
                    registration={register(
                      `attributes.${index}.logged` as const,
                    )}
                    options={loggedList.map(logged => ({
                      label: logged.name,
                      value: logged.type,
                    }))}
                  />
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
        )}
      </FormMultipleFields>
    </FormDrawer>
  )
}
