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
import {
  type HeartBeatDTO,
  useHeartBeat,
  useUpdateHeartBeat,
} from '../../api/deviceAPI/heartbeatDevice'
import { z } from 'zod'

type UpdateDeviceProps = {
  deviceId: string
  name: string
  keyDevice: string
  org_id?: string
  group_id: string
  close: () => void
  isOpen: boolean
  template_id: string
  additional_info: string
}

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

  const { id: projectId } = storage.getProject()

  const { mutate, isLoading, isSuccess } = useUpdateDevice()

  const { mutate: mutateHeartBeat, isLoading: isLoadingHeartBeat } =
    useHeartBeat()
  const { mutate: mutateUpdateHeartBeat, isLoading: isLoadingUpdateHeartBeat } =
    useUpdateHeartBeat()

  const additionalInfo = JSON.parse(additional_info as unknown as string)

  const disableUpdateHeartbeat = !additionalInfo?.heartbeat_interval
    ? true
    : false
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
  const {
    register: registerHeartBeat,
    formState: formStateHeartBeat,
    handleSubmit: handleSubmitHeartBeat,
    getValues: getValuesHeartBeat,
  } = useForm<HeartBeatDTO['data']>({
    resolver: heartBeatSchema && zodResolver(heartBeatSchema),
  })

  const { data: orgData, isLoading: orgIsLoading } = useGetOrgs({ projectId })
  const { acc: orgFlattenData } = flattenData(
    orgData?.organizations,
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )
  const orgSelectOptions = orgFlattenData?.map(org => ({
    label: org?.name,
    value: org?.id,
  }))

  const { data: groupData, isLoading: groupIsLoading } = useGetGroups({
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

  const { data: templateData, isLoading: templateIsLoading} = useGetTemplates({ projectId })

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
            <div className="space-y-1">
              <SelectDropdown
                label={t('cloud:org_manage.device_manage.add_device.parent')}
                name="org_id"
                control={control}
                options={orgSelectOptions}
                isOptionDisabled={option =>
                  option.label === t('loading:org') ||
                  option.label === t('table:no_in_org')
                }
                noOptionsMessage={() => t('table:no_in_org')}
                loadingMessage={() => t('loading:org')}
                isLoading={orgIsLoading}
                placeholder={t(
                  'cloud:org_manage.org_manage.add_org.choose_org',
                )}
                defaultValue={orgSelectOptions?.find(
                  org => org.value === org_id,
                )}
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
                options={groupSelectOptions}
                isOptionDisabled={option =>
                  option.label === t('loading:group') ||
                  option.label === t('table:no_group')
                }
                noOptionsMessage={() => t('table:no_group')}
                loadingMessage={() => t('loading:group')}
                isLoading={groupIsLoading}
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
              defaultValue={additionalInfo?.heartbeat_interval || 0}
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
              defaultValue={additionalInfo?.timeout_lifecycle || 0}
            />
          </div>
          <div className="mt-2 flex justify-end pt-1">
            <Button
              className="bg-secondary-700 mx-2 rounded-sm p-1 text-white"
              variant="trans"
              size="square"
              type="submit"
              isLoading={isLoadingHeartBeat}
            >
              {t('cloud:org_manage.device_manage.add_device.create_heartbeat')}
            </Button>
            <Button
              className="bg-secondary-700 rounded-sm p-1 text-white"
              variant="trans"
              size="square"
              isLoading={isLoadingUpdateHeartBeat}
              disabled={disableUpdateHeartbeat}
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
