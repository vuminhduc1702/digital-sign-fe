import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from 'react-router-dom'
import { z } from 'zod'
import { type SelectInstance } from 'react-select'

import { Button } from '@/components/ui/button'
import {
  InputField,
  SelectDropdown,
  type SelectOption,
} from '@/components/Form'
import storage from '@/utils/storage'
import { useUpdateDevice, type UpdateDeviceDTO } from '../../api/deviceAPI'
import { useGetGroups } from '../../api/groupAPI'
import { deviceSchema } from './CreateDevice'
import { useGetTemplates } from '@/cloud/deviceTemplate/api'
import { useGetOrgs } from '@/layout/MainLayout/api'
import {
  type HeartBeatDTO,
  useHeartBeat,
  useUpdateHeartBeat,
} from '../../api/deviceAPI/heartbeatDevice'

import { type DeviceAdditionalInfo } from '../../types'

import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { SelectSuperordinateOrgTree } from '@/components/SelectSuperordinateOrgTree'
import { useOrgById } from '@/layout/OrgManagementLayout/api'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn, flattenOrgs } from '@/utils/misc'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { NewSelectDropdown } from '@/components/Form/NewSelectDropdown'

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
  org_name?: string
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
  org_name,
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

  const form = useForm<UpdateDeviceDTO['data']>({
    resolver: updateDeviceSchema && zodResolver(updateDeviceSchema),
    defaultValues: {
      name,
      org_id: org_id,
      group_id: group_id,
      template_id: template_id,
      key: keyDevice,
    },
  })
  const { register, formState, control, setValue, handleSubmit, watch, reset } =
    form

  const heartbeatForm = useForm<HeartBeatDTO['data']>({
    resolver: heartBeatSchema && zodResolver(heartBeatSchema),
  })
  const {
    register: registerHeartBeat,
    formState: formStateHeartBeat,
    handleSubmit: handleSubmitHeartBeat,
  } = heartbeatForm

  const { data: orgData } = useGetOrgs({ projectId })
  const orgDataFlatten = flattenOrgs(orgData?.organizations ?? [])
  const { data: orgDataById } = useOrgById({ orgId: org_id ?? '' })

  const { data: groupData, isLoading: groupIsLoading } = useGetGroups({
    orgId: watch('org_id') || orgId,
    projectId,
    offset,
    entity_type: 'DEVICE',
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

  useEffect(() => {
    if (isSuccess && close) {
      close()
    }
  }, [isSuccess])

  const selectDropdownGroupId = useRef<SelectInstance<SelectOption> | null>(
    null,
  )

  useEffect(() => {
    reset()
  }, [isOpen])

  return (
    <Sheet open={isOpen} onOpenChange={close} modal={false}>
      <SheetContent
        onInteractOutside={e => {
          e.preventDefault()
        }}
        className={cn('flex h-full max-w-xl flex-col justify-between')}
      >
        <SheetHeader>
          <SheetTitle>
            {t('cloud:org_manage.device_manage.add_device.edit')}
          </SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
          <div className="flex-y">
            <Form {...form}>
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
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('cloud:org_manage.device_manage.add_device.name')}
                        </FormLabel>
                        <div>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t(
                                'cloud:org_manage.device_manage.add_device.input_require_err',
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="org_id"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormLabel>
                          {t(
                            'cloud:org_manage.device_manage.add_device.parent',
                          )}
                        </FormLabel>
                        <div>
                          <FormControl>
                            <div>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    id="org_id"
                                    className={cn(
                                      'block w-full rounded-md border border-secondary-600 bg-white px-3 py-2 !text-body-sm text-black placeholder-secondary-700 shadow-sm *:appearance-none focus:outline-2 focus:outline-focus-400 focus:ring-focus-400 disabled:cursor-not-allowed disabled:bg-secondary-500',
                                      {
                                        'text-gray-500': !value && value !== '',
                                      },
                                    )}
                                  >
                                    {value
                                      ? orgDataFlatten.find(
                                          item => item.id === value,
                                        )?.name
                                      : value === ''
                                        ? t('tree:no_selection_org')
                                        : t('placeholder:select_org')}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                  <SelectSuperordinateOrgTree
                                    {...field}
                                    onChangeValue={onChange}
                                    value={value}
                                    noSelectionOption={true}
                                    customOnChange={() =>
                                      selectDropdownGroupId.current?.clearValue()
                                    }
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="group_id"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormLabel>
                          {t('cloud:org_manage.device_manage.add_device.group')}
                        </FormLabel>
                        <div>
                          <FormControl>
                            <NewSelectDropdown
                              customOnChange={onChange}
                              refSelect={selectDropdownGroupId}
                              isClearable={false}
                              options={groupSelectOptions}
                              isOptionDisabled={option =>
                                option.label === t('loading:group') ||
                                option.label === t('table:no_group')
                              }
                              noOptionsMessage={() => t('table:no_group')}
                              loadingMessage={() => t('loading:group')}
                              isLoading={groupIsLoading}
                              defaultValue={
                                groupSelectOptions?.find(
                                  group => group.value === group_id,
                                ) ?? ''
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="template_id"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormLabel>
                          {t('cloud:firmware.add_firmware.template')}
                        </FormLabel>
                        <div>
                          <FormControl>
                            <NewSelectDropdown
                              customOnChange={onChange}
                              isClearable={false}
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
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('cloud:org_manage.device_manage.add_device.key')}
                        </FormLabel>
                        <div>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t(
                                'cloud:org_manage.device_manage.add_device.input_require_err',
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </>
              </form>
            </Form>

            <Form {...heartbeatForm}>
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
                <FormLabel className="mx-1 my-2">
                  {t('cloud:org_manage.device_manage.add_device.heartbeat')}
                </FormLabel>
                <div className="flex rounded-lg border border-solid p-2">
                  <FormField
                    control={heartbeatForm.control}
                    name="interval"
                    render={({ field }) => (
                      <FormItem className="flex items-center">
                        <FormLabel className="mx-1">
                          Heartbeat Interval
                        </FormLabel>
                        <div className="mx-1">
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              defaultValue={
                                additional_info?.heartbeat_interval || 0
                              }
                              {...registerHeartBeat('interval', {
                                valueAsNumber: true,
                              })}
                              placeholder={t(
                                'cloud:org_manage.device_manage.add_device.input_require_err',
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={heartbeatForm.control}
                    name="timeout"
                    render={({ field }) => (
                      <FormItem className="flex items-center">
                        <FormLabel className="mx-1">Life circle</FormLabel>
                        <div className="mx-1">
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              defaultValue={
                                additional_info?.timeout_lifecycle || 0
                              }
                              {...registerHeartBeat('timeout', {
                                valueAsNumber: true,
                              })}
                              placeholder={t(
                                'cloud:org_manage.device_manage.add_device.input_require_err',
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
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
                    {t(
                      'cloud:org_manage.device_manage.add_device.create_heartbeat',
                    )}
                  </Button>
                  <Button
                    className="rounded-sm bg-secondary-700 p-1 text-white"
                    variant="trans"
                    size="square"
                    isLoading={isLoadingUpdateHeartBeat}
                    disabled={
                      disableUpdateHeartbeat || isLoadingUpdateHeartBeat
                    }
                    onClick={() => {
                      mutateUpdateHeartBeat({ deviceId })
                    }}
                  >
                    {t('cloud:org_manage.device_manage.add_device.ping')}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
        <SheetFooter>
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
              disabled={!formState.isDirty || isLoading}
            />
          </>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
