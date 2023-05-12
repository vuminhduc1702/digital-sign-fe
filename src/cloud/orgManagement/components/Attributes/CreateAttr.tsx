import * as z from 'zod'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/Button'
import { Form, FormDrawer, InputField, SelectField } from '~/components/Form'
import {
  type CreateAttrDTO,
  useCreateAttr,
  type EntityType,
} from '~/cloud/orgManagement/api/attrAPI'

import { type Attribute } from '~/types'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

type ValueType = {
  type: Attribute['value_type']
  name: string
}

export const valueTypeList: ValueType[] = [
  { type: 'STR', name: 'String' },
  { type: 'BOOL', name: 'Boolean' },
  { type: 'LONG', name: 'Long' },
  { type: 'DBL', name: 'Double' },
  { type: 'JSON', name: 'JSON' },
]

export const loggedList = [
  { type: true, name: 'Có' },
  { type: false, name: 'Không' },
]

export const attrSchema = z.object({
  attribute_key: z.string().min(1, 'Vui lòng nhập để tiếp tục').max(30),
  value: z.string().optional(),
  logged: z.string(),
  value_t: z.string(),
})

type CreateAttrProps = {
  entityId: string
  entityType: EntityType
}
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
      title={t('cloud.org_manage.org_manage.add_attr.title')}
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
      <Form<CreateAttrDTO['data']['attributes'][0], typeof attrSchema>
        id="create-attr"
        onSubmit={values => {
          mutate({
            data: {
              entity_id: entityId,
              entity_type: entityType,
              attributes: [
                {
                  attribute_key: values.attribute_key,
                  value: values.value?.toString(),
                  logged: String(values.logged).toLowerCase() === 'true',
                  value_t: values.value_t,
                },
              ],
            },
          })
        }}
        schema={attrSchema}
      >
        {({ register, formState }) => (
          <>
            <InputField
              label={t('cloud.org_manage.org_manage.add_attr.name') ?? 'Name'}
              error={formState.errors['attribute_key']}
              registration={register('attribute_key')}
            />
            <SelectField
              label={
                t('cloud.org_manage.org_manage.add_attr.value_type') ??
                'Value type'
              }
              error={formState.errors['value_t']}
              registration={register('value_t')}
              options={valueTypeList.map(valueType => ({
                label: valueType.name,
                value: valueType.type,
              }))}
            />
            <InputField
              label={t('cloud.org_manage.org_manage.add_attr.value') ?? 'Value'}
              error={formState.errors['value']}
              registration={register('value')}
            />
            <SelectField
              label={
                t('cloud.org_manage.org_manage.add_attr.logged') ?? 'Logged'
              }
              error={formState.errors['logged']}
              registration={register('logged')}
              options={loggedList.map(logged => ({
                label: logged.name,
                value: logged.type,
              }))}
            />
          </>
        )}
      </Form>
    </FormDrawer>
  )
}
