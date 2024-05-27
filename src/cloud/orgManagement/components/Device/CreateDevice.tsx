import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { type SelectOption } from '@/components/Form'
import { nameSchema } from '@/utils/schemaValidation'
import storage from '@/utils/storage'
import { useCreateDevice, type CreateDeviceDTO } from '../../api/deviceAPI'

import { useEffect, useRef, useState } from 'react'
import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { useGetTemplates } from '@/cloud/deviceTemplate/api'
import { useGetGroups } from '../../api/groupAPI'
import { useGetOrgs } from '@/layout/MainLayout/api'
import { type SelectInstance } from 'react-select'
import { SelectSuperordinateOrgTree } from '@/components/SelectSuperordinateOrgTree'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn, flattenOrgs } from '@/utils/misc'
import { Input } from '@/components/ui/input'
import { NewSelectDropdown } from '@/components/Form/NewSelectDropdown'

export const deviceSchema = z.object({
  name: nameSchema,
  org_id: z.string().optional(),
  project_id: z.string().optional(),
  group_id: z.string().optional(),
  template_id: z.string().optional(),
  key: z.string().optional(),
})

type CreateDeviceProps = {
  open?: () => void
  close?: () => void
  isOpen?: boolean
}

export function CreateDevice({ open, close, isOpen }: CreateDeviceProps) {
  const { t } = useTranslation()

  const projectId = storage.getProject()?.id
  const { mutate, isLoading, isSuccess } = useCreateDevice()
  const [offset, setOffset] = useState(0)

  const { orgId } = useParams()

  const form = useForm<CreateDeviceDTO['data']>({
    resolver: deviceSchema && zodResolver(deviceSchema),
  })
  const { register, formState, control, handleSubmit, watch, reset } = form

  const no_org_val = t('cloud:org_manage.org_manage.add_org.no_org')
  const { data: orgData } = useGetOrgs({ projectId })
  const orgDataFlatten = flattenOrgs(orgData?.organizations ?? [])

  const { data: groupData, isLoading: groupIsLoading } = useGetGroups({
    orgId: watch('org_id') || orgId,
    projectId,
    offset,
    entity_type: 'DEVICE',
  })
  const groupSelectOptions = groupData?.groups?.map(groups => ({
    label: groups?.name,
    value: groups?.id,
  }))

  const { data: templateData, isLoading: templateIsLoading } = useGetTemplates({
    projectId,
  })
  const templateSelectOptions = templateData?.templates?.map(template => ({
    label: template?.name,
    value: template?.id,
  }))

  const selectDropdownGroupId = useRef<SelectInstance<SelectOption> | null>(
    null,
  )

  useEffect(() => {
    if (isSuccess && close) {
      close()
    }
  }, [isSuccess])

  const resetForm = () => {
    close()
    reset()
  }

  return (
    <Sheet open={isOpen} onOpenChange={resetForm} modal={false}>
      <SheetContent
        onInteractOutside={e => {
          e.preventDefault()
        }}
        className={cn('flex h-full max-w-xl flex-col justify-between')}
      >
        <SheetHeader>
          <SheetTitle>
            {t('cloud:org_manage.device_manage.add_device.title')}
          </SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
          <Form {...form}>
            <form
              className="w-full space-y-6"
              id="create-device"
              onSubmit={handleSubmit(values => {
                mutate({
                  data: {
                    project_id: projectId,
                    org_id: values.org_id !== no_org_val ? values.org_id : '',
                    name: values.name,
                    key: values.key,
                    group_id: values.group_id,
                    template_id: values.template_id,
                  },
                })
              })}
            >
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:org_manage.device_manage.add_device.name')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t(
                              'cloud:org_manage.device_manage.add_device.input_require_err',
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="org_id"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:org_manage.device_manage.add_device.parent')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <div>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  id="org_id"
                                  className={cn(
                                    'block w-full rounded-md border border-secondary-600 bg-white px-3 py-2 !text-body-sm text-black placeholder-secondary-700 shadow-sm *:appearance-none focus:outline-2 focus:outline-focus-400 focus:ring-focus-400 disabled:cursor-not-allowed disabled:bg-secondary-500',
                                    {
                                      'text-gray-500': !value && value !== '',
                                    },
                                  )}
                                >
                                  {value
                                    ? orgDataFlatten.find(
                                        item => item.id === value,
                                      )?.name
                                    : value === ''
                                      ? t('tree:no_selection_org')
                                      : t('placeholder:select_org')}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent>
                                <SelectSuperordinateOrgTree
                                  {...field}
                                  onChangeValue={onChange}
                                  value={value}
                                  noSelectionOption={true}
                                  customOnChange={() =>
                                    selectDropdownGroupId.current?.clearValue()
                                  }
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="group_id"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:org_manage.device_manage.add_device.group')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <NewSelectDropdown
                            customOnChange={onChange}
                            refSelect={selectDropdownGroupId}
                            isClearable={false}
                            options={groupSelectOptions}
                            isOptionDisabled={option =>
                              option.label === t('loading:group') ||
                              option.label === t('table:no_group')
                            }
                            noOptionsMessage={() => t('table:no_group')}
                            loadingMessage={() => t('loading:group')}
                            isLoading={groupIsLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="template_id"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:firmware.add_firmware.template')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <NewSelectDropdown
                            customOnChange={onChange}
                            options={templateSelectOptions}
                            isOptionDisabled={option =>
                              option.label === t('loading:template') ||
                              option.label === t('table:no_template')
                            }
                            noOptionsMessage={() => t('table:no_template')}
                            loadingMessage={() => t('loading:template')}
                            isLoading={templateIsLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:org_manage.device_manage.add_device.key')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t(
                              'cloud:org_manage.device_manage.add_device.input_require_err',
                            )}
                          />
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
              onClick={resetForm}
              startIcon={
                <img src={btnCancelIcon} alt="Submit" className="h-5 w-5" />
              }
            />
            <Button
              className="rounded border-none"
              form="create-device"
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
