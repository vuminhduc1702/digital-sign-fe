import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '~/components/Button'
import { Drawer } from '~/components/Drawer'
import { InputField, SelectDropdown } from '~/components/Form'
import { flattenData } from '~/utils/misc'
import storage from '~/utils/storage'
import { useUpdateDevice, type UpdateDeviceDTO } from '../../api/deviceAPI'
import { useGetGroups } from '../../api/groupAPI'
import { deviceSchema } from './CreateDevice'
import { useGetTemplates } from '~/cloud/deviceTemplate/api'
import { useGetOrgs } from '~/layout/MainLayout/api'

import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

type UpdateDeviceProps = {
  deviceId: string
  name: string
  keyDevice: string
  org_id?: string
  group_id: string
  close: () => void
  isOpen: boolean
  template_id: string
}
export function UpdateDevice({
  deviceId,
  name,
  keyDevice,
  org_id,
  group_id,
  close,
  isOpen,
  template_id,
}: UpdateDeviceProps) {
  const { t } = useTranslation()

  const { id: projectId } = storage.getProject()

  const { mutate, isLoading, isSuccess } = useUpdateDevice()
  const [offset, setOffset] = useState(0)

  const {
    register,
    formState,
    control,
    setValue,
    handleSubmit,
    watch,
    resetField,
    getValues,
  } = useForm<UpdateDeviceDTO['data']>({
    resolver: deviceSchema && zodResolver(deviceSchema),
    defaultValues: {
      name,
      org_id: org_id,
      group_id: group_id,
      template_id: template_id,
      key: keyDevice,
    },
  })

  const { data: orgData } = useGetOrgs({ projectId })
  const { acc: orgFlattenData } = flattenData(
    orgData?.organizations,
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )
  const orgSelectOptions = orgFlattenData?.map(org => ({
    label: org?.name,
    value: org?.id,
  }))

  const { data: groupData } = useGetGroups({
    orgId: watch('org_id'),
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

  const { data: templateData } = useGetTemplates({ projectId })
  const templateSelectOptions = templateData?.templates?.map(template => ({
    label: template?.name,
    value: template?.id,
  }))

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  useEffect(() => {
    const dataFilter = orgFlattenData.filter(item => item.id === org_id)
    dataFilter.length && setValue('org_id', dataFilter[0]?.id)
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
            disabled={!formState.isDirty}
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
              template_id: values.template_id,
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
                orgSelectOptions != null
                  ? orgSelectOptions
                  : [{ label: t('loading:org'), value: '' }]
              }
              isOptionDisabled={option => option.label === t('loading:org')}
              noOptionsMessage={() => t('table:no_in_org')}
              placeholder={t('cloud:org_manage.org_manage.add_org.choose_org')}
              defaultValue={orgSelectOptions?.find(org => org.value === org_id)}
              handleChangeSelect={() =>
                resetField('group_id', {
                  defaultValue: '',
                })
              }
            />
          </div>
          <div className="space-y-1">
            <SelectDropdown
              label={t('cloud:org_manage.device_manage.add_device.group')}
              name="group_id"
              control={control}
              options={
                groupData !== null
                  ? groupSelectOptions
                  : groupData == null
                  ? [{ label: t('table:no_group'), value: '' }]
                  : [{ label: t('loading:group'), value: '' }]
              }
              defaultValue={groupSelectOptions?.find(
                group => group.value === group_id,
              )}
            />
          </div>
          <div>
            <SelectDropdown
              label={t('cloud:firmware.add_firmware.template')}
              name="template_id"
              control={control}
              options={
                templateSelectOptions || [
                  { label: t('loading:template'), value: '' },
                ]
              }
              defaultValue={templateSelectOptions?.find(
                template => template.value === template_id,
              )}
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
