import { useEffect, useRef, useState } from 'react'
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
import {
  useHeartBeat,
  useUpdateHeartBeat,
} from '../../api/deviceAPI/heartbeatDevice'

type UpdateDeviceProps = {
  deviceId: string
  name: string
  keyDevice: string
  org_id?: string
  group_id: string
  close: () => void
  isOpen: boolean
  template_id: string
  additional_info?: object
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
  additional_info,
}: UpdateDeviceProps) {
  const { t } = useTranslation()

  const { id: projectId } = storage.getProject()

  const { mutate, isLoading, isSuccess } = useUpdateDevice()

  const { mutate: mutateHeartBeat } = useHeartBeat()
  const { mutate: mutateUpdateHeartBeat } = useUpdateHeartBeat()

  let additionalInfo
  if (typeof additional_info === 'string') {
    try {
      additionalInfo = JSON.parse(additional_info)
    } catch (error) {
      additionalInfo = {}
      console.error('Error parsing JSON:', error)
    }
  }
  const additional_interval = additionalInfo?.heartbeat_interval || 30
  const additional_timeout = additionalInfo?.timeout_lifecycle || 2
  const heartbeatIntervalRef = useRef(additional_interval)
  const timeoutRef = useRef(additional_timeout)

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
        onSubmit={handleSubmit(async values => {
          const heartbeatInterval = heartbeatIntervalRef.current.value
          const heartbeatTimeout = timeoutRef.current.value
          await mutateHeartBeat({
            data: {
              interval: Number(heartbeatInterval),
              timeout: Number(heartbeatTimeout),
            },
            deviceId,
          })
          mutate({
            data: {
              name: values.name,
              key: values.key,
              org_id: values.org_id,
              group_id: values.group_id,
              template_id: values.template_id,
            },
            deviceId,
          })
        })}
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
          <div className="">
            <p className="mx-1 my-2">
              {t('cloud:org_manage.device_manage.add_device.heartbeat')}
            </p>
            <div className="flex rounded-lg border border-solid p-2">
              <InputField
                label="Heartbeat Interval"
                type="number"
                classnamefieldwrapper="flex items-center"
                classlabel="mx-1"
                classchild="mx-1"
                defaultValue={additional_interval}
                ref={heartbeatIntervalRef}
              />
              <InputField
                label="Life Cicrle"
                type="number"
                classnamefieldwrapper="flex items-center"
                classlabel="mx-1"
                classchild="mx-1"
                defaultValue={additional_timeout}
                ref={timeoutRef}
              />
            </div>
            <div className="">
              <Button
                className="hover:text-primary-400 float-right mx-2 rounded-lg border-none px-1"
                variant="trans"
                size="square"
                onClick={() => {
                  const heartbeatInterval = heartbeatIntervalRef.current.value
                  const heartbeatTimeout = timeoutRef.current.value
                  mutateHeartBeat({
                    data: {
                      interval: Number(heartbeatInterval),
                      timeout: Number(heartbeatTimeout),
                    },
                    deviceId,
                  })
                }}
              >
                {t(
                  'cloud:org_manage.device_manage.add_device.create_heartbeat',
                )}
              </Button>
              <Button
                className="hover:text-primary-400 float-right rounded-lg border-none px-1"
                variant="trans"
                size="square"
                onClick={() => {
                  mutateUpdateHeartBeat({ deviceId })
                }}
              >
                {t(
                  'cloud:org_manage.device_manage.add_device.update_heartbeat',
                )}
              </Button>
            </div>
          </div>
        </>
      </form>
    </Drawer>
  )
}
