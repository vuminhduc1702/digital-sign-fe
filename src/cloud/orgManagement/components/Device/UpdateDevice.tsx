import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from 'react-router-dom'
import { z } from 'zod'
import { type SelectInstance } from 'react-select'

import { Button } from '~/components/Button'
import { Drawer } from '~/components/Drawer'
import {
  InputField,
  SelectDropdown,
  type SelectOption,
} from '~/components/Form'
import storage from '~/utils/storage'
import { useUpdateDevice, type UpdateDeviceDTO } from '../../api/deviceAPI'
import { useGetGroups } from '../../api/groupAPI'
import { deviceSchema } from './CreateDevice'
import { useGetTemplates } from '~/cloud/deviceTemplate/api'
import { useGetOrgs } from '~/layout/MainLayout/api'
import { useDefaultCombobox } from '~/utils/hooks'
import {
  type HeartBeatDTO,
  useHeartBeat,
  useUpdateHeartBeat,
} from '../../api/deviceAPI/heartbeatDevice'

import { type DeviceAdditionalInfo } from '../../types'

import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { ComplexTree } from '~/components/ComplexTree'

type UpdateDeviceProps = {
  deviceId: string
  name: string
  keyDevice: string
  org_id?: string
  group_id: string
  close: () => void
  isOpen: boolean
  template_id: string
  additional_info: DeviceAdditionalInfo
}

const updateDeviceSchema = deviceSchema.required({ group_id: true })

export const heartBeatSchema = z.object({
  interval: z.number().min(1, { message: 'Tối thiểu là 1 giây' }),
  timeout: z.number().min(1, { message: 'Tối thiểu là 1 giây' }),
  deviceId: z.string().optional(),
})

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

  const projectId = storage.getProject()?.id

  const { mutate, isLoading, isSuccess } = useUpdateDevice()

  const { orgId } = useParams()

  const { mutate: mutateHeartBeat, isLoading: isLoadingHeartBeat } =
    useHeartBeat()
  const { mutate: mutateUpdateHeartBeat, isLoading: isLoadingUpdateHeartBeat } =
    useUpdateHeartBeat()

  const disableUpdateHeartbeat = !additional_info?.heartbeat_interval
    ? true
    : false
  const [offset, setOffset] = useState(0)

  const { register, formState, control, setValue, handleSubmit, watch } =
    useForm<UpdateDeviceDTO['data']>({
      resolver: updateDeviceSchema && zodResolver(updateDeviceSchema),
      defaultValues: {
        name,
        org_id: org_id,
        group_id: group_id,
        template_id: template_id,
        key: keyDevice,
      },
    })
  const {
    register: registerHeartBeat,
    formState: formStateHeartBeat,
    handleSubmit: handleSubmitHeartBeat,
  } = useForm<HeartBeatDTO['data']>({
    resolver: heartBeatSchema && zodResolver(heartBeatSchema),
  })

  const { data: orgData } = useGetOrgs({ projectId, level: 1 })

  const defaultComboboxGroupData = useDefaultCombobox('group')
  const { data: groupData, isLoading: groupIsLoading } = useGetGroups({
    orgId: watch('org_id')?.toString() || orgId,
    projectId,
    offset,
    entity_type: 'DEVICE',
    config: {
      suspense: false,
    },
  })
  const groupSelectOptions = [
    defaultComboboxGroupData,
    ...(groupData?.groups || []),
  ]?.map(groups => ({
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

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  useEffect(() => {
    const dataFilter = orgFlattenData.filter(item => item.id === org_id)
    dataFilter.length && setValue('org_id', dataFilter[0]?.id)
  }, [org_id])

  const selectDropdownGroupId = useRef<SelectInstance<SelectOption> | null>(
    null,
  )

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
              <img src={btnCancelIcon} alt="Submit" className="size-5" />
            }
          />
          <Button
            className="rounded border-none"
            form="update-device"
            type="submit"
            size="lg"
            isLoading={isLoading}
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="size-5" />
            }
            disabled={!formState.isDirty || isLoading}
          />
        </>
      )}
    >
      <div className="flex-y">
        <form
          id="update-device"
          className="w-full space-y-6"
          onSubmit={handleSubmit(values => {
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
              isClearable={false}
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
              defaultValue={
                groupSelectOptions?.find(group => group.value === group_id) ??
                ''
              }
              error={formState?.errors?.group_id}
            />

            <SelectDropdown
              isClearable={false}
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
              defaultValue={templateSelectOptions?.find(
                template => template.value === template_id,
              )}
              error={formState?.errors?.template_id}
            />

            <InputField
              label={t('cloud:org_manage.device_manage.add_device.key')}
              error={formState.errors['key']}
              registration={register('key')}
            />
          </>
        </form>
        <form
          className="mt-6 w-full"
          onSubmit={handleSubmitHeartBeat(values => {
            mutateHeartBeat({
              data: {
                interval: Number(values.interval),
                timeout: Number(values.timeout),
              },
              deviceId,
            })
          })}
        >
          <p className="mx-1 my-2">
            {t('cloud:org_manage.device_manage.add_device.heartbeat')}
          </p>
          <div className="flex rounded-lg border border-solid p-2">
            <InputField
              registration={registerHeartBeat('interval', {
                valueAsNumber: true,
              })}
              error={formStateHeartBeat.errors['interval']}
              label="Heartbeat Interval"
              type="number"
              classnamefieldwrapper="flex items-center"
              classlabel="mx-1"
              classchild="mx-1"
              defaultValue={additional_info?.heartbeat_interval || 0}
            />
            <InputField
              registration={registerHeartBeat('timeout', {
                valueAsNumber: true,
              })}
              error={formStateHeartBeat.errors['timeout']}
              label="Life circle"
              type="number"
              classnamefieldwrapper="flex items-center"
              classlabel="mx-1"
              classchild="mx-1"
              defaultValue={additional_info?.timeout_lifecycle || 0}
            />
          </div>
          <div className="mt-2 flex justify-end pt-1">
            <Button
              className="mx-2 rounded-sm bg-secondary-700 p-1 text-white"
              variant="trans"
              size="square"
              type="submit"
              isLoading={isLoadingHeartBeat}
            >
              {t('cloud:org_manage.device_manage.add_device.create_heartbeat')}
            </Button>
            <Button
              className="rounded-sm bg-secondary-700 p-1 text-white"
              variant="trans"
              size="square"
              isLoading={isLoadingUpdateHeartBeat}
              disabled={disableUpdateHeartbeat || isLoadingUpdateHeartBeat}
              onClick={() => {
                mutateUpdateHeartBeat({ deviceId })
              }}
            >
              {t('cloud:org_manage.device_manage.add_device.ping')}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}
