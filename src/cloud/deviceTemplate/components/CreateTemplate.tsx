import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'

import { Button } from '~/components/Button'
import {
  FieldWrapper,
  FormDrawer,
  InputField,
  SelectField,
} from '~/components/Form'
import { valueTypeList } from '~/cloud/orgManagement/components/Attributes'
import {
  useCreateTemplate,
  type CreateTemplateDTO,
} from '../api/createTemplate'
import storage from '~/utils/storage'
import { Checkbox } from '~/components/Checkbox'

import { attrSchema, nameSchema } from '~/utils/schemaValidation'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'

export const templateAttrSchema = z.object({
  name: nameSchema,
  attributes: z.array(attrSchema),
})

export default function CreateTemplate() {
  const { t } = useTranslation()

  const { id: projectId } = storage.getProject()

  const { mutate, isLoading, isSuccess } = useCreateTemplate()

  const { register, formState, handleSubmit, control } = useForm<
    CreateTemplateDTO['data']
  >({
    resolver: templateAttrSchema && zodResolver(templateAttrSchema),
    defaultValues: {
      name: '',
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
      <form
        className="w-full space-y-5"
        id="create-template"
        onSubmit={handleSubmit(values => {
          mutate({ data: { ...values, project_id: projectId } })
        })}
      >
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
                  classnamefieldwrapper="mt-2"
                  label={t('cloud:org_manage.org_manage.add_attr.value')}
                  error={formState?.errors?.attributes?.[index]?.value}
                  registration={register(`attributes.${index}.value` as const)}
                />
                <FieldWrapper
                  className="mt-2 space-y-2"
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
    </FormDrawer>
  )
}
