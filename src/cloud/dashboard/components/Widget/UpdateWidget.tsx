import { FormDialog } from '~/components/FormDialog'
import { useTranslation } from 'react-i18next'
import { type z } from 'zod'

import { Button } from '~/components/Button'

import { type widgetSchema } from './CreateWidget'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { EditBtnIcon } from '~/components/SVGIcons'

export function UpdateWidget({
  widgetInfo,
}: {
  widgetInfo?: z.infer<typeof widgetSchema>
}) {
  const { t } = useTranslation()

  return (
    <FormDialog
      size="md"
      title={t('cloud:project_manager.add_project.title')}
      // isDone={isSuccessCreateProject}
      // resetData={handleResetForm}
      body={JSON.stringify(widgetInfo, null, 2)}
      triggerButton={
        <Button
          className="h-5 w-5 hover:text-primary-400"
          variant="none"
          size="square"
          startIcon={<EditBtnIcon width={20} height={17} viewBox="0 0 20 17" />}
        />
      }
      confirmButton={
        <Button
          // isLoading={isLoadingCreateProject}
          form="create-project"
          type="submit"
          size="md"
          className="rounded-md border bg-primary-400"
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    />
  )
}
