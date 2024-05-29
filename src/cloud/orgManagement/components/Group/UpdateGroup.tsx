import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { useUpdateGroup, type UpdateGroupDTO } from '../../api/groupAPI'
import { useUpdateOrgForGroup } from '../../api/groupAPI/updateOrgForGroup'
import { entityTypeList } from './CreateGroup'
import { useGetOrgs } from '@/layout/MainLayout/api'

import { nameSchema } from '@/utils/schemaValidation'
import { type EntityType } from '../../api/attrAPI'

import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import storage from '@/utils/storage'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const groupUpdateSchema = z.object({
  name: nameSchema,
  org_id: z.string().optional(),
})

type UpdateGroupProps = {
  groupId: string
  name: string
  close: () => void
  isOpen: boolean
  organization: string
  org_name: string
  entity_type: Exclude<EntityType, 'GROUP' | 'TEMPLATE'>
}

export function UpdateGroup({
  groupId,
  name,
  close,
  isOpen,
  organization,
  entity_type,
  org_name,
}: UpdateGroupProps) {
  const { t } = useTranslation()

  const entityTypeOptions = entityTypeList.map(entityType => ({
    label: entityType.name,
    value: entityType.type,
  }))

  const projectId = storage.getProject()?.id
  const { data: orgData } = useGetOrgs({ projectId })
  const orgDataFlatten = flattenOrgs(orgData?.organizations ?? [])
  const no_org_val = t('cloud:org_manage.org_manage.add_org.no_org')

  const { mutate, isLoading, isSuccess } = useUpdateGroup()
  const { mutate: mutateUpdateOrgForGroup } = useUpdateOrgForGroup()

  useEffect(() => {
    if (isSuccess && close) {
      close()
    }
  }, [isSuccess])

  const form = useForm<UpdateGroupDTO['data']>({
    resolver: groupUpdateSchema && zodResolver(groupUpdateSchema),
    defaultValues: {
      name: name,
      org_id: organization,
    },
  })
  const { formState, getValues, handleSubmit, reset } = form

  useEffect(() => {
    reset()
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
          <SheetTitle>
            {t('cloud:org_manage.group_manage.add_group.edit')}
          </SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
          <Form {...form}>
            <form
              className="w-full space-y-6"
              id="update-group"
              onSubmit={handleSubmit(values => {
                if (
                  getValues('org_id') !== organization &&
                  getValues('org_id') != null
                ) {
                  mutateUpdateOrgForGroup({
                    data: {
                      ids: [groupId],
                      org_id: values.org_id !== no_org_val ? values.org_id : '',
                    },
                  })
                }
                mutate({
                  data: {
                    name: values.name,
                    org_id: values.org_id !== no_org_val ? values.org_id : '',
                  },
                  groupId,
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
                        {t('cloud:org_manage.group_manage.add_group.name') ??
                          "Group's name"}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t(
                              'cloud:org_manage.event_manage.add_event.input_placeholder',
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  disabled
                  name=""
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>
                        {t(
                          'cloud:org_manage.group_manage.add_group.entity_type',
                        )}
                      </FormLabel>
                      <div>
                        <Select
                          {...field}
                          onValueChange={onChange}
                          value={entity_type.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t(
                                  'cloud:org_manage.event_manage.add_event.input_placeholder',
                                )}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {entityTypeOptions?.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
              form="update-group"
              type="submit"
              size="lg"
              isLoading={isLoading}
              startIcon={
                <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
              }
              disabled={!formState.isDirty || isLoading}
            />
          </>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
