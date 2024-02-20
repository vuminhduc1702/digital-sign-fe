import { t } from 'i18next'
import { Button } from '~/components/Button'
import { Drawer } from '~/components/Drawer'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { FieldWrapper, InputField } from '~/components/Form'
import { z } from 'zod'
import {
  type MqttConfigDTO,
  useUpdateMqttConfig,
} from '../../api/deviceAPI/updateMqttConfig'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Checkbox } from '~/components/Checkbox'
import { useEffect } from 'react'

export const mqttConfigSchema = z.object({
  clean_session: z.boolean(),
  dup: z.boolean(),
  keepalive: z.number(),
  message_type: z.number(),
  protocol_name: z.string(),
  protocol_version: z.number(),
  qos: z.number(),
  remaining_length: z.number(),
  retain: z.boolean(),
  will_flag: z.boolean(),
  will_message: z.string(),
  will_qos: z.number(),
  will_retain: z.boolean(),
  will_topic: z.string(),
})
type UpdateMqttConfigProps = {
  deviceId: string
  close: () => void
  isOpen: boolean
  additional_info: string
}

export function UpdateMqttConfig({
  deviceId,
  close,
  isOpen,
  additional_info,
}: UpdateMqttConfigProps) {
  const { mutate, isLoading, isSuccess } = useUpdateMqttConfig()

  const additionalInfo = JSON.parse(additional_info)
  const MqttConfig = additionalInfo.mqtt_config || {}
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
      dup: MqttConfig.dup || false,
      keepalive: MqttConfig.keepalive || 0,
      message_type: MqttConfig.message_type || 0,
      protocol_name: MqttConfig.protocol_name || '',
      protocol_version: MqttConfig.protocol_version || 0,
      qos: MqttConfig.qos || 0,
      remaining_length: MqttConfig.remaining_length || 0,
      retain: MqttConfig.retain || false,
      will_flag: MqttConfig.will_flag || false,
      will_message: MqttConfig.will_message || '',
      will_qos: MqttConfig.will_qos || 0,
      will_retain: MqttConfig.will_retain || false,
      will_topic: MqttConfig.will_topic || '',
    },
  })
  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])
  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      title={t('cloud:org_manage.device_manage.mqtt_config.title')}
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
      )}
    >
      <>
        <form
          id="update-mqtt"
          className="mt-6"
          onSubmit={handleSubmit(values => {
            mutate({
              data: {
                clean_session: values.clean_session,
                dup: values.dup,
                keepalive: values.keepalive,
                message_type: values.message_type,
                protocol_name: values.protocol_name,
                protocol_version: values.protocol_version,
                qos: values.qos,
                remaining_length: values.remaining_length,
                retain: values.retain,
                will_flag: values.will_flag,
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
            <div className="flex">
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
                label={t('cloud:org_manage.device_manage.mqtt_config.dup')}
                error={formState?.errors['dup']}
                className="w-fit"
              >
                <Controller
                  control={control}
                  name={'dup'}
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
                label={t('cloud:org_manage.device_manage.mqtt_config.retain')}
                error={formState?.errors['retain']}
                className="w-fit"
              >
                <Controller
                  control={control}
                  name={'retain'}
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
                  'cloud:org_manage.device_manage.mqtt_config.will_flag',
                )}
                error={formState?.errors['will_flag']}
                className="w-fit"
              >
                <Controller
                  control={control}
                  name={'will_flag'}
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
            <div className="grid grid-cols-3 gap-3">
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
                  'cloud:org_manage.device_manage.mqtt_config.message_type',
                )}
                type="number"
                error={formState.errors['message_type']}
                registration={register('message_type', {
                  valueAsNumber: true,
                })}
              />
              <InputField
                label={t(
                  'cloud:org_manage.device_manage.mqtt_config.protocol_name',
                )}
                error={formState.errors['protocol_name']}
                registration={register('protocol_name')}
              />
              <InputField
                label={t(
                  'cloud:org_manage.device_manage.mqtt_config.protocol_version',
                )}
                type="number"
                error={formState.errors['protocol_version']}
                registration={register('protocol_version', {
                  valueAsNumber: true,
                })}
              />
              <InputField
                label={t('cloud:org_manage.device_manage.mqtt_config.qos')}
                error={formState.errors['qos']}
                registration={register('qos', {
                  valueAsNumber: true,
                })}
                type="number"
              />

              <InputField
                label={t(
                  'cloud:org_manage.device_manage.mqtt_config.remaining_length',
                )}
                error={formState.errors['remaining_length']}
                registration={register('remaining_length', {
                  valueAsNumber: true,
                })}
                type="number"
              />

              <InputField
                label={t(
                  'cloud:org_manage.device_manage.mqtt_config.will_message',
                )}
                error={formState.errors['will_message']}
                registration={register('will_message')}
              />
              <InputField
                label={t('cloud:org_manage.device_manage.mqtt_config.will_qos')}
                error={formState.errors['will_qos']}
                registration={register('will_qos', {
                  valueAsNumber: true,
                })}
                type="number"
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
      </>
    </Drawer>
  )
}
