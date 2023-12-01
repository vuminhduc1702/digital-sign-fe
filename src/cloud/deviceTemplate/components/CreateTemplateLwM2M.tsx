import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'

import { Button } from '~/components/Button'
import {
  FieldWrapper,
  FormDrawer,
  SelectDropdown,
  InputField,
  SelectField,
} from '~/components/Form'
import { valueTypeList } from '~/cloud/orgManagement/components/Attributes'
import {
  useCreateTemplate,
  type CreateTemplateDTO,
  useUpdateTemplate,
} from '../api'
import storage from '~/utils/storage'
import { Checkbox } from '~/components/Checkbox'
import { flattenData } from '~/utils/misc.ts'
import { attrSchema, nameSchema } from '~/utils/schemaValidation'
import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import { useGetRulechains } from '../api/getRulechains'

export const templateAttrSchema = z.object({
  name: nameSchema,
  rule_chain_id: z.string().optional(),
  attributes: z.array(attrSchema),
})

export default function CreateTemplate() {
  const { t } = useTranslation()

  const { id: projectId } = storage.getProject()
  const { data: ruchainsData, isLoading: isLoadingRuchains } = useGetRulechains({ projectId })

  const { acc: RuleFlattenData } = flattenData(
    ruchainsData?.data,
    ['id', 'name'],
  )

  const RuleSelectOptions = RuleFlattenData?.map(ruchains => ({
    label: ruchains?.name,
    value: JSON.parse(ruchains?.id)?.id,
  }))
  const { mutate: mutateUpdateTemplate } = useUpdateTemplate({ isOnCreateTemplate: true })

  const {
    mutateAsync: mutateAsyncCreateTemplate,
    isLoading: isLoadingCreateTemplate,
    isSuccess: isSuccessCreateTemplate,
  } = useCreateTemplate()
 
  const { register, formState, handleSubmit, control} = useForm<
    CreateTemplateDTO['data']
  >({
    resolver: templateAttrSchema && zodResolver(templateAttrSchema),
    defaultValues: {
      name: '',
      rule_chain_id: '',
      attributes: [{ attribute_key: '', value: '', logged: true, value_t: '' }],
    },
  })
  const { fields, append, remove } = useFieldArray({
    name: 'attributes',
    control,
  })
  return (
    <FormDrawer
      isDone={isLoadingCreateTemplate}
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
          isLoading={isSuccessCreateTemplate}
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    >
      <form
        className="w-full space-y-5"
        id="create-template"
        onSubmit={handleSubmit(async values => {
          const dataCreateTemplate = await mutateAsyncCreateTemplate({
            data: {
              project_id: projectId,
              rule_chain_id: values.rule_chain_id,
              name: values.name,
              attributes: values.attributes
            },
          })
          mutateUpdateTemplate({
            data: {
              name: dataCreateTemplate.name,
              rule_chain_id: dataCreateTemplate.rule_chain_id,
              attributes: dataCreateTemplate.attributes,
            },
            templateId: dataCreateTemplate.id,
          })
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
              }
              )
            }
          />
          <InputField
            label={t('cloud:device_template.add_template.name')}
            error={formState.errors['name']}
            registration={register('name')}
          />
          {/* <div className="space-y-1">
                <SelectDropdown
                  isClearable={true}
                  label={t('cloud:device_template.add_template.flow')}
                  name="rule_chain_id"
                  control={control}
                  options={RuleSelectOptions}
                  isOptionDisabled={option => option.label === t('loading:flow_id')}
                  noOptionsMessage={() => t('table:no_in_flow_id')}
                  loadingMessage={() => t('loading:flow_id')}
                  isLoading={isLoadingRuchains}
                  placeholder={t('cloud:device_template.add_template.choose_flow_id')}
                />
                <p className="text-body-sm text-primary-400">
                  {formState?.errors?.rule_chain_id?.message}
                </p>   
          </div> */}
          {/* <div className="space-y-1">
                    <SelectDropdown
                      label={
                        t('cloud:role_manage.add_policy.resources') ??
                        'Authorization resources'
                      }
                      name={`policies.${index}.resources`}
                      options={resourcesList.map(
                        resourcesType => resourcesType,
                      )}
                      control={control}
                      isMulti
                      closeMenuOnSelect={false}
                    />
                    <p className="text-body-sm text-primary-400">
                      {formState?.errors?.policies?.[index]?.resources?.message}
                    </p>
            </div> */}
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
    </FormDrawer>
  )
}
