import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useParams } from 'react-router-dom'
import { Button } from '~/components/Button'
import { Drawer } from '~/components/Drawer'
import {
  InputField,
  SelectDropdown,
} from '~/components/Form'
import { queryClient } from '~/lib/react-query'
import { flattenData } from '~/utils/misc'
import storage from '~/utils/storage'
import { useUpdateDevice, type UpdateDeviceDTO } from '../../api/deviceAPI'
import { useGetGroups } from '../../api/groupAPI'
import { deviceSchema } from './CreateDevice'
import { useGetTemplates } from '~/cloud/deviceTemplate/api'

import { type OrgList } from '~/layout/MainLayout/types'

import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

type UpdateDeviceProps = {
  deviceId: string
  name: string
  keyDevice: string
  org_id?: string
  group: {
    label: string | ''
    value: string | ''
  }
  close: () => void
  isOpen: boolean
  template_name: string
  template_id: string
}
export function UpdateDevice({
  deviceId,
  name,
  keyDevice,
  org_id,
  group,
  close,
  isOpen,
  template_name,
  template_id,
}: UpdateDeviceProps) {
  console.log(group)
  const { t } = useTranslation()

  const { mutate, isLoading, isSuccess } = useUpdateDevice()
  const [offset, setOffset] = useState(0)
  
  const orgListCache: OrgList | undefined = queryClient.getQueryData(['orgs'], {
    exact: false,
  })
  const { acc: orgFlattenData } = flattenData(
    orgListCache?.organizations || [],
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )

  const { orgId } = useParams()
  const { id: projectId } = storage.getProject()
  const { data: groupData } = useGetGroups({
    orgId,
    projectId,
    offset,
    entity_type: 'DEVICE',
  })
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
  const { data } = useGetTemplates({ projectId })
>>>>>>> c821404... Update select dropdown for org and group

  const orgSelectOptions = orgFlattenData
    ?.map(org => ({
      label: org?.name,
      value: org?.id,
    }))
    .sort((a, b) => a.value.length - b.value.length)

<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> 3f4b019... Update select dropdown
=======
  const orgSelectOptions = orgFlattenData
    ?.map(org => ({
      label: org?.name,
      value: org?.id,
    }))
    .sort((a, b) => a.value.length - b.value.length)

>>>>>>> 3f4b019... Update select dropdown
  const { data } = useGetTemplates({ projectId })

  const orgSelectOptions = orgFlattenData
    ?.map(org => ({
      label: org?.name,
      value: org?.id,
    }))
    .sort((a, b) => a.value.length - b.value.length)

=======
>>>>>>> c821404... Update select dropdown for org and group
  const groupSelectOptions = groupData?.groups?.map(groups => ({
    label: groups?.name,
    value: groups?.id,
  }))

  const templateSelectOptions = data?.templates?.map(template => ({
    label: template?.name,
    value: template?.id,
  }))

  const { register, formState, control, setValue, getValues, handleSubmit } = useForm<
    UpdateDeviceDTO['data']
  >({
    resolver: deviceSchema && zodResolver(deviceSchema),
    defaultValues: { name, org_id, group_id: group.value, template_id: template_id, key: keyDevice },
  })
  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  useEffect(() => {
    const dataFilter = orgFlattenData.filter(item => item.id === org_id)
    dataFilter.length &&
      setValue('org_id', dataFilter[0]?.id)
  }, [org_id])

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      title={t('cloud:org_manage.device_manage.add_device.edit')}
      renderFooter={() => (
        <>
          <Button
            className="rounded border-none"
            variant="secondary"
            size="lg"
            onClick={close}
            startIcon={
              <img src={btnCancelIcon} alt="Submit" className="h-5 w-5" />
            }
          />
          <Button
            className="rounded border-none"
            form="update-device"
            type="submit"
            size="lg"
            isLoading={isLoading}
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
          />
        </>
      )}
    >
      <form
        id="update-device"
        className="w-full space-y-6"
        onSubmit={handleSubmit(values =>
          mutate({
            data: {
              name: values.name,
              key: values.key,
              org_id: values.org_id,
              group_id: values.group_id,
              template_id: values.template_id || '',
            },
            deviceId,
          }),
        )}
      >
        <>
          <InputField
            label={
              t('cloud:org_manage.device_manage.add_device.name') ??
              "Device's name"
            }
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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
              defaultValue={orgSelectOptions?.find(org => org.value === getValues('org_id'))}
=======
>>>>>>> 3f4b019... Update select dropdown
=======
              defaultValue={orgSelectOptions?.find(org => org.value === getValues('org_id'))}
>>>>>>> c821404... Update select dropdown for org and group
=======
>>>>>>> 3f4b019... Update select dropdown
            />
          </div>
          <div className="space-y-1">
            <SelectDropdown
              label={t('cloud:org_manage.device_manage.add_device.group')}
              name="group_id"
              control={control}
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
              options={ groupSelectOptions || [{ label: t('loading:org'), value:'' }]
=======
=======
>>>>>>> 3f4b019... Update select dropdown
              options={
                groupData?.groups?.map(groups => ({
                  label: groups?.name,
                  value: groups?.id,
                })) || [{ label: t('loading:org'), value: '' }]
>>>>>>> 3f4b019... Update select dropdown
=======
              options={ groupSelectOptions || [{ label: t('loading:org'), value:'' }]
>>>>>>> c821404... Update select dropdown for org and group
              }
              defaultValue={groupSelectOptions?.find(group => group.value === getValues('group_id'))}
            />
          </div>
          <div>
            <SelectDropdown
              isClearable
              label={t('cloud:firmware.add_firmware.template')}
              name="template_id"
              control={control}
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
              options={ templateSelectOptions || [{ label: '', value: '' }]}
              defaultValue={templateSelectOptions?.find(template => template.value === getValues('template_id'))}
=======
=======
>>>>>>> 3f4b019... Update select dropdown
              options={
                data?.templates?.map(template => ({
                  label: template?.name,
                  value: template?.id,
                })) || [{ label: '', value: '' }]
              }
>>>>>>> 3f4b019... Update select dropdown
=======
              options={ templateSelectOptions || [{ label: '', value: '' }]}
              defaultValue={templateSelectOptions?.find(template => template.value === getValues('template_id'))}
>>>>>>> c821404... Update select dropdown for org and group
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
    </Drawer>
  )
}
