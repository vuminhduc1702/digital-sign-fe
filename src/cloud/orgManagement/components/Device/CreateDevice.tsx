import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '~/components/Button'
import {
  FormDrawer,
  InputField,
  SelectDropdown,
  type SelectOptionString,
} from '~/components/Form'
import { queryClient } from '~/lib/react-query'
import { flattenData } from '~/utils/misc'
import { nameSchema } from '~/utils/schemaValidation'
import storage from '~/utils/storage'
import { useCreateDevice, type CreateDeviceDTO } from '../../api/deviceAPI'

import { type OrgList } from '~/layout/MainLayout/types'

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { useGetTemplates } from '~/cloud/deviceTemplate/api'
import { PlusIcon } from '~/components/SVGIcons'
import { useGetGroups } from '../../api/groupAPI'

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

  const { id: projectId } = storage.getProject()
  const { orgId } = useParams()
  const { mutate, isLoading, isSuccess } = useCreateDevice()
  const [offset, setOffset] = useState(0)

  const { data } = useGetTemplates({ projectId })

  const { data: groupData } = useGetGroups({
    orgId,
    projectId,
    offset,
    entity_type: 'DEVICE',
  })

  const orgListCache: OrgList | undefined = queryClient.getQueryData(['orgs'], {
    exact: false,
  })
  const { acc: orgFlattenData } = flattenData(
    orgListCache?.organizations,
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )
  const orgSelectOptions = orgFlattenData
    ?.map(org => ({
      label: org?.name,
      value: org?.id,
    }))
    .sort((a, b) => a.value.length - b.value.length)

  const groupSelectOptions = groupData?.groups?.map(groups => ({
    label: groups?.name,
    value: groups?.id,
  }))

  const templateSelectOptions = data?.templates?.map(template => ({
    label: template?.name,
    value: template?.id,
  }))

  const { register, formState, control, setValue, handleSubmit } = useForm<
    CreateDeviceDTO['data']
  >({
    resolver: deviceSchema && zodResolver(deviceSchema),
  })

  return (
    <FormDrawer
      isDone={isSuccess}
      triggerButton={
        <Button
          className="rounded-md"
          variant="trans"
          size="square"
          startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
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
          disabled={!formState.isDirty}
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
              org_id: values.org_id,
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
          <div className="space-y-1">
            <SelectDropdown
              label={t('cloud:org_manage.device_manage.add_device.parent')}
              name="org_id"
              control={control}
              options={
                orgSelectOptions !== null ? orgSelectOptions : [{ label: t('loading:org'), value: '' }]
              }
              isOptionDisabled={option =>
                option.label === t('loading:org')
              }
              noOptionsMessage={() => t('table:no_in_org')}
              placeholder={t('cloud:org_manage.org_manage.add_org.choose_org')}
            />
            <p className="text-body-sm text-primary-400">
              {formState?.errors?.org_id?.message}
            </p>
          </div>
          <div className="space-y-1">
            <SelectDropdown
              label={t('cloud:org_manage.device_manage.add_device.group')}
              name="group_id"
              control={control}
              options={
                groupSelectOptions !== null ? groupSelectOptions : [{ label: t('loading:org'), value: '' }]
              }
            />
          </div>
          <div className="space-y-1">
            <SelectDropdown
              label={t('cloud:firmware.add_firmware.template')}
              name="template_id"
              control={control}
              options={ 
                templateSelectOptions !== null ? templateSelectOptions : [{ label: '', value: '' }]
              }
            />
            <p className="text-body-sm text-primary-400">
              {formState?.errors?.template_id?.message}
            </p>
          </div>
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
