import { useTranslation } from 'react-i18next'

import { Button } from '~/components/Button'
import { Form, FormDrawer, InputField, SelectField } from '~/components/Form'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { useCreateDashboard } from '../../api/createDashboard'

type CreateDashboardProps = {
  projectId: string
}

export type CreateDashboardDTO = {
  data: {
    title: string
    projectId: string,
    description: string
  }
}

export function CreateDashboard({ projectId }: CreateDashboardProps) {
  const { t } = useTranslation()

  const { mutate, isLoading, isSuccess } = useCreateDashboard()

  // TODO: Choose bool valueType then InputField switch to Listbox

  return (
    <FormDrawer
      isDone={isSuccess}
      triggerButton={
        <Button
          className="h-9 w-9 rounded-md"
          variant="trans"
          size="square"
          startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
      }
      title={t('cloud:dashboard.add_dashboard.title')}
      submitButton={
        <Button
          className="rounded border-none"
          form="create-dashboard"
          type="submit"
          size="lg"
          isLoading={isLoading}
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    >
      <Form<CreateDashboardDTO['data']>
        id="create-dashboard"
        onSubmit={values => {
          mutate({
            data: {
              title: values.title,
              project_id: projectId,
              configuration: {
                description: values.description
              }
            },
          })
        }}
      >
        {({ register, formState }) => (
          <>
            <InputField
              label={t('cloud:dashboard.add_dashboard.name') ?? 'Title'}
              error={formState.errors['title']}
              registration={register('title')}
            />
            <InputField
              label={t('cloud:dashboard.add_dashboard.description') ?? 'Description'}
              error={formState.errors['description']}
              registration={register('description')}
            />
          </>
        )}
      </Form>
    </FormDrawer>
  )
}
