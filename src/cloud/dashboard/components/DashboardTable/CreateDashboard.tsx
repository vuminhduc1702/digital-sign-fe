import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Button } from '~/components/Button'
import { Form, FormDrawer, InputField } from '~/components/Form'
import {
  type CreateDashboardDTO,
  useCreateDashboard,
} from '../../api/createDashboard'

import { widgetListSchema } from '../Widget'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
export const dashboardSchema = z.object({
  title: z.string(),
  configuration: z.object({
    description: z.string(),
    widgets: widgetListSchema.nullish(),
  }),
  dashboard_setting: z
    .object({
      layout: z.array(z.any()),
      starred: z.boolean(),
      last_viewed: z.date().optional(),
    })
    .nullish(),
  project_id: z.string().optional(),
})

export type Dashboard = z.infer<typeof dashboardSchema>

type CreateDashboardProps = {
  projectId: string
}

export function CreateDashboard({ projectId }: CreateDashboardProps) {
  const { t } = useTranslation()

  const { mutate, isLoading, isSuccess } = useCreateDashboard()
  const { register, formState, control, setValue, handleSubmit } = useForm<
    CreateDashboardDTO['data']
  >({
    resolver: dashboardSchema && zodResolver(dashboardSchema),
  })
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
      {/* <Form<CreateDashboardDTO['data'], typeof dashboardSchema> */}
      <form
        id="create-dashboard"
        onSubmit={handleSubmit(values => {
          mutate({
            data: {
              title: values.title,
              project_id: projectId,
              configuration: {
                description: values.configuration.description,
                widgets: null,
              },
              dashboard_setting: null,
            },
          })
        })}
        // schema={dashboardSchema}
      >
        {/* {
        ({ register, formState }) => {
          console.log('formState errors', formState.errors)
          return ( */}
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
      {/* )
        }}
      </Form> */}
    </FormDrawer>
  )
}
