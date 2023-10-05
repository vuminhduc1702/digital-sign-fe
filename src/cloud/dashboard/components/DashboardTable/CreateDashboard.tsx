import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Button } from '~/components/Button'
import { Form, FormDrawer, InputField } from '~/components/Form'
import {
  type CreateDashboardDTO,
  useCreateDashboard,
} from '../../api/createDashboard'

import { widgetConfigSchema } from '../Widget'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

export const dashboardSchema = z.object({
  title: z.string(),
  configuration: z.object({
    description: z.string(),
    widgets: widgetConfigSchema.nullable(),
  }),
  project_id: z.string().optional(),
})

export type Dashboard = z.infer<typeof dashboardSchema>

type CreateDashboardProps = {
  projectId: string
}

export function CreateDashboard({ projectId }: CreateDashboardProps) {
  const { t } = useTranslation()

  const { mutate, isLoading, isSuccess } = useCreateDashboard()

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
      <Form<CreateDashboardDTO['data'], typeof dashboardSchema>
        id="create-dashboard"
        onSubmit={values => {
          mutate({
            data: {
              title: values.title,
              project_id: projectId,
              configuration: {
                description: values.configuration.description,
                widgets: null,
              },
            },
          })
        }}
        schema={dashboardSchema}
      >
        {({ register, formState }) => (
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
        )}
      </Form>
    </FormDrawer>
  )
}
