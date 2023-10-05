import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { useGetTemplates } from '~/cloud/deviceTemplate/api'
import { Button } from '~/components/Button'
import {
  Form,
  InputField,
  SelectDropdown,
  type SelectOption,
} from '~/components/Form'
import { FormDialog } from '~/components/FormDialog'
import { PlusIcon } from '~/components/SVGIcons'
import { nameSchema, versionSchema } from '~/utils/schemaValidation'
import storage from '~/utils/storage'
import {
  useCreateFireWare,
  type CreateFirmWareDTO,
} from '../../api/firmwareAPI/createFirmware'
import i18n from '~/i18n'

export const entityFirmWareSchema = z.object({
  name: nameSchema,
  template_id: z
    .string()
    .nonempty({ message: i18n.t('cloud:firmware.choose_template') }),
  tag: z.string(),
  version: versionSchema,
  description: z.string(),
})

export function CreateThing() {
  const { t } = useTranslation()

  const { id: projectId } = storage.getProject()
  const [templateValue, setTemplateValue] = useState<SelectOption | null>()

  const { data } = useGetTemplates({ projectId })

  const { mutate, isLoading, isSuccess } = useCreateFireWare()

  return (
    <FormDialog
      resetData={() => setTemplateValue(null)}
      isDone={isSuccess}
      title={t('cloud:firmware.add_firmware.title')}
      body={
        <Form<CreateFirmWareDTO['data'], typeof entityFirmWareSchema>
          id="create-firm-ware"
          className="flex flex-col justify-between"
          onSubmit={values => {
            mutate({
              data: {
                name: values.name,
                project_id: projectId,
                tag: values.tag,
                version: values.version,
                template_id: templateValue?.value || '',
                description: values.description,
              },
            })
          }}
          options={{
            defaultValues: { template_id: '' },
          }}
          schema={entityFirmWareSchema}
        >
          {({ register, formState, control, setError, setValue }) => {
            return (
              <>
                <div className="space-y-1">
                  <SelectDropdown
                    isClearable={false}
                    label={t('cloud:firmware.add_firmware.template')}
                    name="template_id"
                    control={control}
                    value={templateValue}
                    onChange={e => {
                      setValue('template_id', e.value)
                      setError('template_id', { message: '' })
                      setTemplateValue(e)
                    }}
                    options={
                      data?.templates?.map(template => ({
                        label: template?.name,
                        value: template?.id,
                      })) || [{ label: '', value: '' }]
                    }
                  />
                  <p className="text-body-sm text-primary-400">
                    {formState?.errors?.template_id?.message}
                  </p>
                </div>
                <InputField
                  label={t('cloud:firmware.add_firmware.name')}
                  error={formState.errors['name']}
                  registration={register('name')}
                />
                <InputField
                  label={t('cloud:firmware.add_firmware.version')}
                  error={formState.errors['version']}
                  registration={register('version')}
                />
                <InputField
                  label={t('cloud:firmware.add_firmware.tag')}
                  error={formState.errors['tag']}
                  registration={register('tag')}
                />
                <InputField
                  label={t('cloud:firmware.add_firmware.description')}
                  error={formState.errors['description']}
                  registration={register('description')}
                />
              </>
            )
          }}
        </Form>
      }
      triggerButton={
        <Button
          className="rounded-md"
          variant="trans"
          size="square"
          startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
      }
      confirmButton={
        <Button
          isLoading={isLoading}
          form="create-firm-ware"
          type="submit"
          size="md"
          className="bg-primary-400"
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    />
  )
}
