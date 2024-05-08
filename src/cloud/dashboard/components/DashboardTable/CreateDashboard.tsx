import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { InputField } from '@/components/Form'
import {
  type CreateDashboardDTO,
  useCreateDashboard,
} from '../../api/createDashboard'

import { widgetListSchema } from '../Widget'
import { nameSchema } from '@/utils/schemaValidation'

import { PlusIcon } from '@/components/SVGIcons'
import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/utils/misc'
import { useEffect } from 'react'

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
  open?: () => void
  close?: () => void
  isOpen?: boolean
}

export function CreateDashboard({
  projectId,
  open,
  close,
  isOpen,
}: CreateDashboardProps) {
  const { t } = useTranslation()

  const { mutate, isLoading, isSuccess } = useCreateDashboard()
  const { register, formState, handleSubmit, reset } = useForm<
    CreateDashboardDTO['data']
  >({
    resolver: dashboardSchema && zodResolver(dashboardSchema),
  })

  useEffect(() => {
    if (isSuccess && close) {
      close()
    }
  }, [isSuccess])

  return (
    <Sheet open={isOpen} onOpenChange={close} modal={false}>
      <SheetContent
        onInteractOutside={e => {
          e.preventDefault()
        }}
        className={cn('flex h-full max-w-xl flex-col justify-between')}
      >
        <SheetHeader>
          <SheetTitle>{t('cloud:dashboard.add_dashboard.title')}</SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
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
        </div>

        <SheetFooter>
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
              form="create-dashboard"
              type="submit"
              size="lg"
              isLoading={isLoading}
              startIcon={
                <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
              }
            />
          </>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
