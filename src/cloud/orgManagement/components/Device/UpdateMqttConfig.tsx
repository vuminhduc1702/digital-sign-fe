import { t } from 'i18next'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { FieldWrapper, InputField } from '@/components/Form'
import { z } from 'zod'
import {
  type MqttConfigDTO,
  useUpdateMqttConfig,
} from '../../api/deviceAPI/updateMqttConfig'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Checkbox } from '@/components/ui/checkbox'

import { type DeviceAdditionalInfo } from '../../types'
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
import { cn } from '@/utils/misc'

export const mqttConfigSchema = z.object({
  clean_session: z.boolean(),
  keepalive: z.number(),
  will_message: z.string(),
  will_qos: z.number(),
  will_retain: z.boolean(),
  will_topic: z.string(),
})
type UpdateMqttConfigProps = {
  deviceId: string
  close: () => void
  isOpen: boolean
  additional_info: DeviceAdditionalInfo
}

export function UpdateMqttConfig({
  deviceId,
  close,
  isOpen,
  additional_info,
}: UpdateMqttConfigProps) {
  const { mutate, isLoading, isSuccess } = useUpdateMqttConfig()

  const MqttConfig = additional_info.mqtt_config || {}
  const {
    register,
    formState,
    setValue,
    handleSubmit,
    watch,
    resetField,
    control,
    getValues,
  } = useForm<MqttConfigDTO['data']>({
    resolver: mqttConfigSchema && zodResolver(mqttConfigSchema),
    defaultValues: {
      clean_session: MqttConfig.clean_session || false,
      keepalive: MqttConfig.keepalive || 0,
      will_message: MqttConfig.will_message || '',
      will_qos: MqttConfig.will_qos || 0,
      will_retain: MqttConfig.will_retain || false,
      will_topic: MqttConfig.will_topic || '',
    },
  })
  useEffect(() => {
    if (isSuccess && close) {
      close()
    }
  }, [isSuccess])
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
            {t('cloud:org_manage.device_manage.mqtt_config.title')}
          </SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
          <form
            id="update-mqtt"
            className="mt-6"
            onSubmit={handleSubmit(values => {
              mutate({
                data: {
                  clean_session: values.clean_session,
                  keepalive: values.keepalive,
                  will_message: values.will_message,
                  will_qos: values.will_qos,
                  will_retain: values.will_retain,
                  will_topic: values.will_topic,
                },
                deviceId,
              })
            })}
          >
            <>
              <div className="mb-3 flex">
                <FieldWrapper
                  label={t(
                    'cloud:org_manage.device_manage.mqtt_config.clean_session',
                  )}
                  error={formState?.errors['clean_session']}
                  className="w-fit"
                >
                  <Controller
                    control={control}
                    name={'clean_session'}
                    render={({ field: { onChange, value, ...field } }) => {
                      return (
                        <Checkbox
                          {...field}
                          checked={value}
                          onCheckedChange={onChange}
                        />
                      )
                    }}
                  />
                </FieldWrapper>
                <FieldWrapper
                  label={t(
                    'cloud:org_manage.device_manage.mqtt_config.will_retain',
                  )}
                  error={formState?.errors['will_retain']}
                  className="w-fit"
                >
                  <Controller
                    control={control}
                    name={'will_retain'}
                    render={({ field: { onChange, value, ...field } }) => {
                      return (
                        <Checkbox
                          {...field}
                          checked={value}
                          onCheckedChange={onChange}
                        />
                      )
                    }}
                  />
                </FieldWrapper>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label={t(
                    'cloud:org_manage.device_manage.mqtt_config.keepalive',
                  )}
                  type="number"
                  error={formState.errors['keepalive']}
                  registration={register('keepalive', {
                    valueAsNumber: true,
                  })}
                />
                <InputField
                  label={t(
                    'cloud:org_manage.device_manage.mqtt_config.will_message',
                  )}
                  error={formState.errors['will_message']}
                  registration={register('will_message')}
                />
                <InputField
                  label={t(
                    'cloud:org_manage.device_manage.mqtt_config.will_qos',
                  )}
                  error={formState.errors['will_qos']}
                  registration={register('will_qos', {
                    valueAsNumber: true,
                  })}
                  type="number"
                  min={0}
                  max={2}
                />
                <InputField
                  label={t(
                    'cloud:org_manage.device_manage.mqtt_config.will_topic',
                  )}
                  error={formState.errors['will_topic']}
                  registration={register('will_topic')}
                />
              </div>
            </>
          </form>
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
              form="update-mqtt"
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
