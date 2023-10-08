import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

import { Button } from '~/components/Button'
import { Form, InputField } from '~/components/Form'
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
  configuration: string
}

export function UpdateDashboard({
  id,
  close,
  isOpen,
  title,
  configuration,
}: UpdateDashboardProps) {
  const { t } = useTranslation()

  const { mutate, isLoading, isSuccess } = useUpdateDashboard()

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
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
          />
        </>
      )}
    >
      <Form<UpdateDashboardDTO['data'], typeof dashboardSchema>
        id="update-dashboard"
        onSubmit={values => {
          mutate({
            data: {
              title: values.title,
              configuration: {
                description: values.configuration.description,
                widgets: null,
              },
            },
            dashboardId: id,
          })
        }}
        options={{
          defaultValues: {
            title,
            configuration: {
              description: JSON.parse(configuration as unknown as string)
                ?.description,
              widgets: null,
            },
          },
        }}
        schema={dashboardSchema}
      >
        {({ register, formState }) => {
          console.log('formState errors: ', formState.errors)
          return (
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
          )
        }}
      </Form>
    </Drawer>
  )
}
