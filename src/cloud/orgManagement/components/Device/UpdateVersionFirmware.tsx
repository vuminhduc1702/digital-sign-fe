import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '~/components/Button'
import { SelectDropdown, type SelectOption } from '~/components/Form'

import { useGetFirmwares } from '~/cloud/firmware/api/firmwareAPI'
import {
  type UpdateVersionFirmwareDTO,
  useUpdateVersionFirmware,
} from '~/cloud/firmware/api/firmwareAPI/updateVersionFirmware'
import { Drawer } from '~/components/Drawer'
import storage from '~/utils/storage'
import i18n from '~/i18n'

import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

type UploadFileFirmWareProps = {
  deviceId: string
  close: () => void
  isOpen: boolean
}

export const updateVersionSchema = z.object({
  version: z.string().min(1, { message: i18n.t('cloud:firmware.choose_fota') }),
})

export function UpdateVersionFirmWare({
  deviceId,
  close,
  isOpen,
}: UploadFileFirmWareProps) {
  const { t } = useTranslation()
  const [fotaValue, setFotaValue] = useState<SelectOption | null>()

  const projectId = storage.getProject()?.id
  const { data } = useGetFirmwares({
    projectId,
    config: { suspense: false },
  })

  const { mutate, isLoading, isSuccess } = useUpdateVersionFirmware()
  const { formState, setError, control, setValue, handleSubmit } = useForm<
    UpdateVersionFirmwareDTO['data']
  >({
    resolver: updateVersionSchema && zodResolver(updateVersionSchema),
    defaultValues: { version: '' },
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
      title={t('cloud:firmware.update_version')}
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
            form="update-version"
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
        <div className="space-y-1">
          <SelectDropdown
            isClearable={false}
            label={t('cloud:firmware.fota')}
            name="version"
            control={control}
            options={
              data?.data?.map(fota => ({
                label: `${fota.name} (${fota.version})`,
                value: `${fota.name} (${fota.version})`,
              })) || [{ label: '', value: '' }]
            }
          />
          <p className="text-body-sm text-primary-400">
            {formState?.errors?.version?.message}
          </p>
        </div>
      </form>
    </Drawer>
  )
}
