import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '~/components/Button'
import { InputField } from '~/components/Form'
import { Drawer } from '~/components/Drawer'

import { type UpdateDashboardDTO, useUpdateDashboard } from '../../api'
import { dashboardSchema } from '.'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'

type UpdateDashboardProps = {
  id: string
  close: () => void
  isOpen: boolean
  title: string
  description: string
}

export function UpdateDashboard({
  id,
  close,
  isOpen,
  title,
  description,
}: UpdateDashboardProps) {
  const { t } = useTranslation()

  const { mutate, isLoading, isSuccess } = useUpdateDashboard()
  const { register, formState, handleSubmit } = useForm<
    UpdateDashboardDTO['data']
  >({
    resolver: dashboardSchema && zodResolver(dashboardSchema),
    defaultValues: {
      title,
      configuration: {
        description,
        widgets: null,
      },
      dashboard_setting: null,
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
      title={t('cloud:dashboard.add_dashboard.edit')}
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
            form="update-dashboard"
            type="submit"
            size="lg"
            isLoading={isLoading}
            disabled={!formState.isDirty || isLoading}
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
          />
        </>
      )}
    >
      <form
        id="update-dashboard"
        className="w-full space-y-6"
        onSubmit={handleSubmit(values => {
          mutate({
            data: {
              title: values.title,
              configuration: {
                description: values.configuration.description,
                widgets: null,
              },
              dashboard_setting: null,
            },
            dashboardId: id,
          })
        })}
      >
        <>
          <InputField
            label={t('cloud:dashboard.add_dashboard.name')}
            error={formState.errors['title']}
            registration={register('title')}
          />
          <InputField
            label={t('cloud:dashboard.add_dashboard.description')}
            error={formState?.errors?.configuration?.description}
            registration={register('configuration.description')}
          />
        </>
      </form>
    </Drawer>
  )
}
