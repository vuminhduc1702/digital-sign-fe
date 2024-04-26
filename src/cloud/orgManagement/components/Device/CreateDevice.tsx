import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from 'react-router-dom'

import { Button } from '@/components/Button'
import {
  InputField,
  SelectDropdown,
  type SelectOption,
} from '@/components/Form'
import { nameSchema } from '@/utils/schemaValidation'
import storage from '@/utils/storage'
import { useCreateDevice, type CreateDeviceDTO } from '../../api/deviceAPI'

import { useRef, useState } from 'react'
import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { useGetTemplates } from '@/cloud/deviceTemplate/api'
import { PlusIcon } from '@/components/SVGIcons'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover'
import { cn, flattenOrgs } from '@/utils/misc'

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

  return (
    <Sheet open={isOpen} onOpenChange={close} modal={false}>
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
                close && close()
              })}
            >
              <>
                <InputField
                  label={t('cloud:org_manage.device_manage.add_device.name')}
                  error={formState.errors['name']}
                  registration={register('name')}
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
                <SelectDropdown
                  error={formState?.errors?.template_id}
                  label={t('cloud:firmware.add_firmware.template')}
                  name="template_id"
                  control={control}
                  options={templateSelectOptions}
                  isOptionDisabled={option =>
                    option.label === t('loading:template') ||
                    option.label === t('table:no_template')
                  }
                  noOptionsMessage={() => t('table:no_template')}
                  loadingMessage={() => t('loading:template')}
                  isLoading={templateIsLoading}
                />

                <InputField
                  label={t('cloud:org_manage.device_manage.add_device.key')}
                  error={formState.errors['key']}
                  registration={register('key')}
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
