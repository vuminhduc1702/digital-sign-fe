import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'

import { useGetFirmwares } from '@/cloud/firmware/api/firmwareAPI'
import {
  type UpdateVersionFirmwareDTO,
  useUpdateVersionFirmware,
} from '@/cloud/firmware/api/firmwareAPI/updateVersionFirmware'
import storage from '@/utils/storage'
import i18n from '@/i18n'

import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
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
import { NewSelectDropdown } from '@/components/Form/NewSelectDropdown'

type UploadFileFirmWareProps = {
  deviceId: string
  templateId: string
  close: () => void
  isOpen: boolean
}

export const updateVersionSchema = z.object({
  version: z.string().min(1, { message: i18n.t('cloud:firmware.choose_fota') }),
})

export function UpdateVersionFirmWare({
  deviceId,
  templateId,
  close,
  isOpen,
}: UploadFileFirmWareProps) {
  const { t } = useTranslation()

  const projectId = storage.getProject()?.id
  const { data } = useGetFirmwares({
    projectId,
    templateId,
  })

  const { mutate, isLoading, isSuccess } = useUpdateVersionFirmware()
  const form = useForm<UpdateVersionFirmwareDTO['data']>({
    resolver: updateVersionSchema && zodResolver(updateVersionSchema),
    defaultValues: { version: '' },
  })
  const { handleSubmit } = form
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
          <SheetTitle>{t('cloud:firmware.update_version')}</SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
          <Form {...form}>
            <form
              id="update-version"
              className="mt-2 flex w-full flex-col justify-between space-y-6"
              onSubmit={handleSubmit(values => {
                const fota = values?.version.split('(')
                const name = fota?.[0].slice(0, -1) || ''
                const version = fota?.[1].slice(0, -1) || ''
                mutate({
                  data: {
                    device_ids: [deviceId],
                    version: version,
                    project_id: projectId,
                    name: name,
                  },
                })
              })}
            >
              <FormField
                control={form.control}
                name="version"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>{t('cloud:firmware.fota')}</FormLabel>
                    <div>
                      <FormControl>
                        <NewSelectDropdown
                          isPosition={false}
                          isClearable={false}
                          customOnChange={onChange}
                          options={
                            data?.data?.map(fota => ({
                              label: `${fota.name} (${fota.version})`,
                              value: `${fota.name} (${fota.version})`,
                            })) || [{ label: '', value: '' }]
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
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
              form="update-version"
              type="submit"
              size="lg"
              isLoading={isLoading}
              startIcon={
                <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
              }
            />
          </>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
