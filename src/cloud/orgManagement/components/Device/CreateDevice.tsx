import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from 'react-router-dom'

import { Button } from '@/components/Button'
import {
  FormDrawer,
  InputField,
  SelectDropdown,
  type SelectOption,
} from '@/components/Form'
import { nameSchema } from '@/utils/schemaValidation'
import storage from '@/utils/storage'
import { useCreateDevice, type CreateDeviceDTO } from '../../api/deviceAPI'

import { useRef, useState } from 'react'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { useGetTemplates } from '@/cloud/deviceTemplate/api'
import { PlusIcon } from '@/components/SVGIcons'
import { useGetGroups } from '../../api/groupAPI'
import { useGetOrgs } from '@/layout/MainLayout/api'
import { type SelectInstance } from 'react-select'
import { ComplexTree } from '@/components/ComplexTree'

export const deviceSchema = z.object({
  name: nameSchema,
  org_id: z.string().optional(),
  project_id: z.string().optional(),
  group_id: z.string().optional(),
  template_id: z.string().optional(),
  key: z.string().optional(),
})

export function CreateDevice() {
  const { t } = useTranslation()

  const projectId = storage.getProject()?.id
  const { mutate, isLoading, isSuccess } = useCreateDevice()
  const [offset, setOffset] = useState(0)

  const { orgId } = useParams()

  const { register, formState, control, handleSubmit, watch, reset } = useForm<
    CreateDeviceDTO['data']
  >({
    resolver: deviceSchema && zodResolver(deviceSchema),
  })

  const no_org_val = t('cloud:org_manage.org_manage.add_org.no_org')
  const { data: orgData } = useGetOrgs({ projectId, level: 1 })

  const { data: groupData, isLoading: groupIsLoading } = useGetGroups({
    orgId: watch('org_id') || orgId,
    projectId,
    offset,
    entity_type: 'DEVICE',
    config: {
      suspense: false,
    },
  })
  const groupSelectOptions = groupData?.groups?.map(groups => ({
    label: groups?.name,
    value: groups?.id,
  }))

  const { data: templateData, isLoading: templateIsLoading } = useGetTemplates({
    projectId,
  })
  const templateSelectOptions = templateData?.templates?.map(template => ({
    label: template?.name,
    value: template?.id,
  }))

  const selectDropdownGroupId = useRef<SelectInstance<SelectOption> | null>(
    null,
  )

  return (
    <FormDrawer
      isDone={isSuccess}
      resetData={() => reset()}
      triggerButton={
        <Button className="h-[38px] rounded border-none">
          {t('cloud:org_manage.device_manage.add_device.button')}
        </Button>
      }
      title={t('cloud:org_manage.device_manage.add_device.title')}
      submitButton={
        <Button
          className="rounded border-none"
          form="create-device"
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
        className="w-full space-y-6"
        id="create-device"
        onSubmit={handleSubmit(values => {
          mutate({
            data: {
              project_id: projectId,
              org_id: values.org_id !== no_org_val ? values.org_id : '',
              name: values.name,
              key: values.key,
              group_id: values.group_id,
              template_id: values.template_id,
            },
          })
        })}
      >
        <>
          <InputField
            label={t('cloud:org_manage.device_manage.add_device.name')}
            error={formState.errors['name']}
            registration={register('name')}
          />

          <ComplexTree
            name="org_id"
            label={t('cloud:org_manage.device_manage.add_device.parent')}
            error={formState?.errors?.org_id}
            control={control}
            options={orgData?.organizations}
            customOnChange={() => selectDropdownGroupId.current?.clearValue()}
          />

          <SelectDropdown
            refSelect={selectDropdownGroupId}
            label={t('cloud:org_manage.device_manage.add_device.group')}
            name="group_id"
            control={control}
            options={groupSelectOptions}
            isOptionDisabled={option =>
              option.label === t('loading:group') ||
              option.label === t('table:no_group')
            }
            noOptionsMessage={() => t('table:no_group')}
            loadingMessage={() => t('loading:group')}
            isLoading={groupIsLoading}
            error={formState?.errors?.group_id}
          />

          <SelectDropdown
            error={formState?.errors?.template_id}
            label={t('cloud:firmware.add_firmware.template')}
            name="template_id"
            control={control}
            options={templateSelectOptions}
            isOptionDisabled={option =>
              option.label === t('loading:template') ||
              option.label === t('table:no_template')
            }
            noOptionsMessage={() => t('table:no_template')}
            loadingMessage={() => t('loading:template')}
            isLoading={templateIsLoading}
          />

          <InputField
            label={t('cloud:org_manage.device_manage.add_device.key')}
            error={formState.errors['key']}
            registration={register('key')}
          />
        </>
      </form>
    </FormDrawer>
  )
}
