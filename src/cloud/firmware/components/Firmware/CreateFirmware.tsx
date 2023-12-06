import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useGetTemplates } from '~/cloud/deviceTemplate/api'
import { Button } from '~/components/Button'
import {
  InputField,
  SelectDropdown,
  type SelectOption,
} from '~/components/Form'
import { FormDialog } from '~/components/FormDialog'
import storage from '~/utils/storage'
import {
  useCreateFireWare,
  type CreateFirmWareDTO,
} from '../../api/firmwareAPI/createFirmware'
import i18n from '~/i18n'

import { nameSchema, versionSchema } from '~/utils/schemaValidation'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { PlusIcon } from '~/components/SVGIcons'

export const entityFirmWareSchema = z.object({
  name: nameSchema,
  template_id: z
    .string()
    .min(1, { message: i18n.t('cloud:firmware.choose_template') }),
  tag: z.string(),
  version: versionSchema,
  description: z.string(),
})

export function CreateFirmWare() {
  const { t } = useTranslation()

  const projectId = storage.getProject()?.id
  const [templateValue, setTemplateValue] = useState<SelectOption | null>()

  const { data } = useGetTemplates({ projectId })

  const { mutate, isLoading, isSuccess } = useCreateFireWare()
  const { register, formState, control, setValue, handleSubmit, setError } =
    useForm<CreateFirmWareDTO['data']>({
      resolver: entityFirmWareSchema && zodResolver(entityFirmWareSchema),
      defaultValues: { template_id: '' },
    })
  return (
    <FormDialog
      resetData={() => setTemplateValue(null)}
      isDone={isSuccess}
      title={t('cloud:firmware.add_firmware.title')}
      body={
        <form
          id="create-firm-ware"
          className="flex w-full flex-col justify-between space-y-6"
          onSubmit={handleSubmit(values => {
            mutate({
              data: {
                name: values.name,
                project_id: projectId,
                tag: values.tag,
                version: values.version,
                template_id: values?.template_id || '',
                description: values.description,
              },
            })
          })}
        >
          <>
            <div className="space-y-1">
              <SelectDropdown
                isClearable={false}
                label={t('cloud:firmware.add_firmware.template')}
                name="template_id"
                control={control}
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
        </form>
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
