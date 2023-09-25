import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { useSpinDelay } from 'spin-delay'

import { Button } from '~/components/Button'
import { Form, InputField } from '~/components/Form'
import { Drawer } from '~/components/Drawer'
import { Spinner } from '~/components/Spinner'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import {
  type UpdateDashboardDTO,
  useUpdateDashboard,
  useGetDashboardsById,
} from '../../api'

type UpdateDashboardProps = {
  projectId: string,
  id: string,
  title: string,
  close: () => void
  isOpen: boolean
}

export function UpdateDashboard({
  projectId,
  id,
  close,
  isOpen,
}: UpdateDashboardProps) {
  const { t } = useTranslation()

  const { mutate, isLoading, isSuccess } = useUpdateDashboard()

  const { data: dashboardData, isLoading: dashboardLoading } = useGetDashboardsById(
    {
      id,
      config: { suspense: false },
    },
  )

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  const showSpinner = useSpinDelay(dashboardLoading, {
    delay: 150,
    minDuration: 300,
  })

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
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
          />
        </>
      )}
    >
      {dashboardLoading ? (
        <div className="flex grow items-center justify-center">
          <Spinner showSpinner={showSpinner} size="xl" />
        </div>
      ) : (
        <Form<UpdateDashboardDTO['data']['dashboards']>
          id="update-dashboard"
          onSubmit={values => {
            mutate({
              data: {
                dashboards: 
                  {
                    id: values.id,
                    name: values.id,
                    title: values.title,
                    tenant_id: values.tenant_id,
                    created_time: values.created_time,
                    configuration: {
                      description: values.configuration.description,
                      widgets: null
                    }
                  }
              },
              dashboardId: projectId
            })
          }}
          options={{
            defaultValues: {
              title: dashboardData?.title,
              configuration: {
                description: dashboardData?.configuration.description
              }
            },
          }}
        >
          {({ register, formState }) => (
            <>
              {}
              <InputField
                label={
                  t('cloud:dashboard.add_dashboard.name') ?? 'Name'
                }
                error={formState.errors['title']}
                registration={register('title')}
              />
              <InputField
                label={
                  t('cloud:dashboard.add_dashboard.description') ??
                  'Description'
                }
                registration={register('configuration.description')}
              />
            </>
          )}
        </Form>
      )}
    </Drawer>
  )
}
