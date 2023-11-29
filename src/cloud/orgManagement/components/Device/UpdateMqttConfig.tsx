import { t } from 'i18next'
import { Button } from '~/components/Button'
import { Drawer } from '~/components/Drawer'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
export function UpdateMqttConfig({ deviceId, close, isOpen }) {
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
            //   isLoading={isLoading}
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
            //   disabled={!formState.isDirty}
          />
        </>
      )}
    >
      <>
        <form></form>
      </>
    </Drawer>
  )
}
