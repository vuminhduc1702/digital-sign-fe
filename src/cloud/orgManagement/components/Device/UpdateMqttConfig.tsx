import { t } from 'i18next'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { z } from 'zod'
import {
  type MqttConfigDTO,
  useUpdateMqttConfig,
} from '../../api/deviceAPI/updateMqttConfig'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Checkbox } from '@/components/ui/checkbox'

import { type DeviceAdditionalInfo } from '../../types'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/utils/misc'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

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
  const form = useForm<MqttConfigDTO['data']>({
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
  const { register, formState, handleSubmit, control } = form
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
          <Form {...form}>
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
                  <FormField
                    control={form.control}
                    name="clean_session"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem className="relative w-full">
                        <FormLabel>
                          {t(
                            'cloud:org_manage.device_manage.mqtt_config.clean_session',
                          )}
                        </FormLabel>
                        <div>
                          <FormControl>
                            <Checkbox
                              {...field}
                              checked={value}
                              onCheckedChange={onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="will_retain"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem className="relative w-full">
                        <FormLabel>
                          {t(
                            'cloud:org_manage.device_manage.mqtt_config.will_retain',
                          )}
                        </FormLabel>
                        <div>
                          <FormControl>
                            <Checkbox
                              {...field}
                              checked={value}
                              onCheckedChange={onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="keepalive"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t(
                            'cloud:org_manage.device_manage.mqtt_config.keepalive',
                          )}
                        </FormLabel>
                        <div>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              {...register('keepalive', {
                                valueAsNumber: true,
                              })}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="will_message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t(
                            'cloud:org_manage.device_manage.mqtt_config.will_message',
                          )}
                        </FormLabel>
                        <div>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="will_qos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t(
                            'cloud:org_manage.device_manage.mqtt_config.will_qos',
                          )}
                        </FormLabel>
                        <div>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              {...register('will_qos', {
                                valueAsNumber: true,
                              })}
                              min={0}
                              max={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="will_topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t(
                            'cloud:org_manage.device_manage.mqtt_config.will_topic',
                          )}
                        </FormLabel>
                        <div>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </>
            </form>
          </Form>
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
