import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/Button'
import { FormDrawer, InputField } from '@/components/Form'
import {
  type CreateDashboardDTO,
  useCreateDashboard,
} from '../../api/createDashboard'

import { widgetListSchema } from '../Widget'
import { nameSchema } from '@/utils/schemaValidation'

import { PlusIcon } from '@/components/SVGIcons'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'

export const dashboardSchema = z.object({
  id: z.string().optional(),
  title: nameSchema,
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
  const { register, formState, handleSubmit, reset } = useForm<
    CreateDashboardDTO['data']
  >({
    resolver: dashboardSchema && zodResolver(dashboardSchema),
  })
  console.log('formState.errors', formState.errors)

  return (
    <FormDrawer
      isDone={isSuccess}
      resetData={() => reset()}
      triggerButton={
        <Button className="h-[38px] rounded border-none">
          {t('cloud:dashboard.add_dashboard.button')}
        </Button>
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
      <form
        id="create-dashboard"
        className="w-full space-y-6"
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
    </FormDrawer>
  )
}
