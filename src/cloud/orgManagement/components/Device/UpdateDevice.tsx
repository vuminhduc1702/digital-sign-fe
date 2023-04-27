import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { useSpinDelay } from 'spin-delay'

import {
  useDeviceById,
  type UpdateDeviceDTO,
  useUpdateDevice,
} from '../../api/deviceAPI'
import { Button } from '~/components/Button'
import { Form, InputField } from '~/components/Form'
import { Drawer } from '~/components/Drawer'
import { Spinner } from '~/components/Spinner'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'

const deviceSchema = z.object({
  name: z.string(),
})

type UpdateDeviceProps = {
  deviceId: string
  close: () => void
  isOpen: boolean
}
export function UpdateDevice({ deviceId, close, isOpen }: UpdateDeviceProps) {
  const { t } = useTranslation()

  const { mutate, isLoading, isSuccess } = useUpdateDevice()

  const { data: deviceData, isLoading: deviceLoading } = useDeviceById({
    deviceId,
    config: { suspense: false },
  })

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  const showSpinner = useSpinDelay(deviceLoading, {
    delay: 150,
    minDuration: 300,
  })

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      title={t('cloud.org_manage.device_manage.add_device.edit')}
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
          />
        </>
      )}
    >
      {deviceLoading ? (
        <div className="flex grow items-center justify-center">
          <Spinner showSpinner={showSpinner} size="xl" />
        </div>
      ) : (
        <Form<UpdateDeviceDTO['data'], typeof deviceSchema>
          id="update-device"
          onSubmit={values =>
            mutate({
              data: {
                name: values.name,
              },
              deviceId,
            })
          }
          schema={deviceSchema}
          options={{
            defaultValues: {
              name: deviceData?.name,
            },
          }}
        >
          {({ register, formState }) => (
            <>
              <InputField
                label={
                  t('cloud.org_manage.device_manage.add_device.name') ??
                  "Device's name"
                }
                error={formState.errors['name']}
                registration={register('name')}
              />
            </>
          )}
        </Form>
      )}
    </Drawer>
  )
}
