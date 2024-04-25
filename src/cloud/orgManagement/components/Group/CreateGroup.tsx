import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/Button'
import { InputField, SelectField } from '@/components/Form'
import storage from '@/utils/storage'
import { useCreateGroup, type CreateGroupDTO } from '../../api/groupAPI'
import { nameSchema } from '@/utils/schemaValidation'
import { useGetOrgs } from '@/layout/MainLayout/api'

import { PlusIcon } from '@/components/SVGIcons'
import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { SelectSuperordinateOrgTree } from '@/components/SelectSuperordinateOrgTree'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover'
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
import { cn, flattenOrgs } from '@/utils/misc'

export const entityTypeList = [
  { type: 'ORGANIZATION', name: 'Tổ chức' },
  { type: 'DEVICE', name: 'Thiết bị' },
  { type: 'USER', name: 'Người dùng' },
  { type: 'EVENT', name: 'Sự kiện' },
] as const

const groupCreateSchema = z.object({
  name: nameSchema,
  entity_type: z.string(),
  org_id: z.string().optional(),
})

type CreateGroupProps = {
  open?: () => void
  close?: () => void
  isOpen?: boolean
}

export function CreateGroup({ open, close, isOpen }: CreateGroupProps) {
  const { t } = useTranslation()

  const entityTypeOptions = entityTypeList.map(entityType => ({
    label: entityType.name,
    value: entityType.type,
  }))

  const projectId = storage.getProject()?.id
  const { data: orgData } = useGetOrgs({ projectId })
  const orgDataFlatten = flattenOrgs(orgData?.organizations ?? [])
  const no_org_val = t('cloud:org_manage.org_manage.add_org.no_org')

  const { mutate, isLoading, isSuccess } = useCreateGroup()
  const form = useForm<CreateGroupDTO['data']>({
    resolver: groupCreateSchema && zodResolver(groupCreateSchema),
  })
  const {
    register,
    formState,
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
  } = form

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
            {t('cloud:org_manage.group_manage.add_group.title')}
          </SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
          <Form {...form}>
            <form
              id="create-group"
              className="w-full space-y-6"
              onSubmit={handleSubmit(values => {
                mutate({
                  data: {
                    name: values.name,
                    entity_type: values.entity_type,
                    project_id: projectId,
                    org_id: values.org_id !== no_org_val ? values.org_id : '',
                  },
                })
              })}
            >
              <>
                <InputField
                  label={t('cloud:org_manage.group_manage.add_group.name')}
                  error={formState.errors['name']}
                  registration={register('name')}
                />
                <SelectField
                  label={t(
                    'cloud:org_manage.group_manage.add_group.entity_type',
                  )}
                  error={formState.errors['entity_type']}
                  registration={register('entity_type')}
                  options={entityTypeOptions}
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
              form="create-group"
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
