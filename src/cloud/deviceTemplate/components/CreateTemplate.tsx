import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import { Button } from '~/components/Button'
import {
  FormDrawer,
  FormMultipleFields,
  InputField,
  SelectField,
} from '~/components/Form'
import {
  loggedList,
  valueTypeList,
} from '~/cloud/orgManagement/components/Attributes'
import {
  useCreateTemplate,
  type CreateTemplateDTO,
} from '../api/createTemplate'
import storage from '~/utils/storage'

import { nameSchema } from '~/utils/schemaValidation'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'

export const templateAttrSchema = z.object({
  name: nameSchema,
  attributes: z.array(
    z.object({
      attribute_key: z
        .string()
        .min(1, { message: 'Tên thuộc tính quá ngắn' })
        .max(30, { message: 'Tên thuộc tính quá dài' }),
      value: z.string().optional(),
      logged: z.boolean(),
      value_t: z.string().min(1, { message: 'Vui lòng chọn loại giá trị' }),
    }),
  ),
})

export default function CreateTemplate() {
  const { t } = useTranslation()

  const { id: projectId } = storage.getProject()

  const { mutate, isLoading, isSuccess } = useCreateTemplate()

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
      title={t('cloud:device_template.add_template.title')}
      submitButton={
        <Button
          className="rounded border-none"
          form="create-template"
          type="submit"
          size="lg"
          isLoading={isLoading}
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    >
      <FormMultipleFields<CreateTemplateDTO['data'], typeof templateAttrSchema>
        id="create-template"
        onSubmit={values => {
          mutate({ data: { ...values, project_id: projectId } })
          console.log(values)
        }}
        schema={templateAttrSchema}
        options={{
          defaultValues: {
            name: '',
            attributes: [
              { attribute_key: '', value: '', logged: true, value_t: '' },
            ],
          },
        }}
        name={['attributes']}
      >
        {({ register, formState, control }, { fields, append, remove }) => (
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
              label={t('cloud:device_template.add_template.name') ?? 'Name'}
              error={formState.errors['name']}
              registration={register('name')}
            />
            {fields.map((field, index) => (
              <section key={field.id}>
                <InputField
                  label={
                    t('cloud:org_manage.org_manage.add_attr.name') ?? 'Name'
                  }
                  error={formState?.errors?.attributes?.[index]?.attribute_key}
                  registration={register(
                    `attributes.${index}.attribute_key` as const,
                  )}
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
                  registration={register(`attributes.${index}.value` as const)}
                />
                <SelectField
                  label={
                    t('cloud:org_manage.org_manage.add_attr.logged') ?? 'Logged'
                  }
                  error={formState?.errors?.attributes?.[index]?.logged}
                  registration={register(`attributes.${index}.logged` as const)}
                  options={loggedList.map(logged => ({
                    label: logged.name,
                    value: logged.type,
                  }))}
                />
                <Button
                    type="button"
                    size="square"
                    variant="trans"
                    className="mt-3 self-start border-none"
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
