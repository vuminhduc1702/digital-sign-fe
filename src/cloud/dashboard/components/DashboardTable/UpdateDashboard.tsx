import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'

import { type UpdateDashboardDTO, useUpdateDashboard } from '../../api'
import { dashboardSchema } from '.'

import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

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

  const dataDefault = {
    title,
    configuration: {
      description,
      widgets: null,
    },
    dashboard_setting: null,
  }

  const { mutateAsync, isLoading, isSuccess } = useUpdateDashboard()
  const form = useForm<UpdateDashboardDTO['data']>({
    resolver: dashboardSchema && zodResolver(dashboardSchema),
    defaultValues: dataDefault,
  })
  const { register, formState, handleSubmit, reset } = form

  useEffect(() => {
    if (isSuccess && close) {
      close()
    }
  }, [isSuccess])

  useEffect(() => {
    reset(dataDefault)
  }, [isOpen])

  return (
    <Sheet open={isOpen} onOpenChange={close} modal={false}>
      <SheetContent
        onInteractOutside={e => {
          e.preventDefault()
        }}
        className={cn('flex h-full max-w-xl flex-col justify-between')}
      >
        <SheetHeader>
          <SheetTitle>{t('cloud:dashboard.add_dashboard.edit')}</SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
          <Form {...form}>
            <form
              id="update-dashboard"
              className="w-full space-y-6"
              onSubmit={handleSubmit(async values => {
                await mutateAsync({
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
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:dashboard.add_dashboard.name')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input
                            {...field}
                            value={value}
                            onChange={e => onChange(e)}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="configuration.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:dashboard.add_dashboard.description')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </>
            </form>
          </Form>
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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
