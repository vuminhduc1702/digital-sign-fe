import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import TitleBar from '@/components/Head/TitleBar'
import storage from '@/utils/storage'
import { useCreateRole, type CreateRoleDTO } from '../api'
import { useGetGroups } from '@/cloud/orgManagement/api/groupAPI'
import { cn } from '@/utils/misc'

import { nameSchema } from '@/utils/schemaValidation'
import { type PolicyActions, type PolicyResources } from '../types'
import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { PlusIcon } from '@/components/SVGIcons'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { NewSelectDropdown } from '@/components/Form/NewSelectDropdown'

export const resourcesList = [
  { value: 'users', label: i18n.t('schema:users') },
  { value: 'groups', label: i18n.t('schema:groups') },
  { value: 'templates', label: i18n.t('schema:templates') },
  { value: 'events', label: i18n.t('schema:events') },
  { value: 'organizations', label: i18n.t('schema:organizations') },
  { value: 'roles', label: i18n.t('schema:roles') },
  { value: 'projects', label: i18n.t('schema:projects') },
  { value: 'devices', label: i18n.t('schema:devices') },
] as const

export const actionsList = [
  { value: 'read', label: i18n.t('schema:read') },
  { value: 'create', label: i18n.t('schema:create') },
  { value: 'modify', label: i18n.t('schema:modify') },
  { value: 'delete', label: i18n.t('schema:delete') },
] as const

export const roleSchema = z
  .object({
    name: nameSchema,
  })
  .and(
    z.discriminatedUnion('role_type', [
      z.object({
        role_type: z.literal('Generic'),
        policies: z.array(
          z.object({
            policy_name: nameSchema,
            resources: z
              .array(z.string())
              .nonempty({ message: i18n.t('schema:select_resource') }),
            actions: z
              .array(z.string())
              .nonempty({ message: i18n.t('schema:select_action') }),
          }),
        ),
      }),
      z.object({
        role_type: z.literal('Group'),
        policies: z.array(
          z
            .object({
              policy_name: nameSchema,
              actions: z
                .array(z.string())
                .nonempty({ message: 'Vui lòng chọn ít nhất 1 hành động' }),
              devices: z
                .array(z.string())
                .nonempty({ message: 'Vui lòng chọn ít nhất 1 nhóm' }),
              events: z
                .array(z.string())
                .nonempty({ message: 'Vui lòng chọn ít nhất 1 nhóm' }),
              users: z
                .array(z.string())
                .nonempty({ message: 'Vui lòng chọn ít nhất 1 nhóm' }),
              orgs: z
                .array(z.string())
                .nonempty({ message: 'Vui lòng chọn ít nhất 1 nhóm' }),
            })
            .refine(
              ({ devices, events, orgs, users }) => {
                return (
                  devices.length > 0 ||
                  events.length > 0 ||
                  orgs.length > 0 ||
                  users.length > 0
                )
              },
              { message: 'Vui lòng chọn ít nhất 1 nhóm' },
            ),
        ),
      }),
    ]),
  )

type CreateRoleProps = {
  project_id?: string
  open?: () => void
  close?: () => void
  isOpen?: boolean
}

export function CreateRole({
  project_id = '',
  open,
  close,
  isOpen,
}: CreateRoleProps) {
  const { t } = useTranslation()
  const [type, setType] = useState('Generic')

  const roleType = ['Generic', 'Group']

  const form = useForm<CreateRoleDTO['data']>({
    resolver: roleSchema && zodResolver(roleSchema),
    defaultValues: {
      name: '',
      policies: [
        {
          policy_name: '',
          resources: [],
          actions: [],
          devices: [],
          users: [],
          events: [],
          orgs: [],
        },
      ],
      role_type: 'Generic',
    },
  })
  const { handleSubmit, control, setValue, reset } = form

  const { fields, append, remove, replace } = useFieldArray({
    name: 'policies',
    control,
  })

  const dataStorage = storage.getProject()

  let projectId = project_id ? project_id : dataStorage?.id

  const { mutate, isLoading, isSuccess } = useCreateRole()

  const { data: groupData, isLoading: isLoadingGroup } = useGetGroups({
    projectId,
  })
  const groupDataDeviceOptions = groupData?.groups
    ?.filter(item => item.entity_type === 'DEVICE')
    ?.map(groups => ({
      label: groups.name,
      value: groups.id,
    }))
  const groupDataEventOptions = groupData?.groups
    ?.filter(item => item.entity_type === 'EVENT')
    ?.map(groups => ({
      label: groups.name,
      value: groups.id,
    }))
  const groupDataUserOptions = groupData?.groups
    ?.filter(item => item.entity_type === 'USER')
    ?.map(groups => ({
      label: groups.name,
      value: groups.id,
    }))
  const groupDataOrgOptions = groupData?.groups
    ?.filter(item => item.entity_type === 'ORGANIZATION')
    ?.map(groups => ({
      label: groups.name,
      value: groups.id,
    }))

  const resourceArrRef = useRef<PolicyResources[]>([])
  const actionArrRef = useRef<PolicyActions[]>([])

  const resetData = () => {
    reset()
    setType('Generic')
  }

  const resetForm = () => {
    close()
    form.reset()
  }

  useEffect(() => {
    if (isSuccess && close) {
      close()
    }
  }, [isSuccess])

  return (
    <Sheet open={isOpen} onOpenChange={resetForm} modal={false}>
      <SheetContent
        onInteractOutside={e => {
          e.preventDefault()
        }}
        className={cn('flex h-full max-w-4xl flex-col justify-between')}
      >
        <SheetHeader>
          <SheetTitle>{t('cloud:role_manage.add_role.title')}</SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
          <Form {...form}>
            <form
              id="create-role"
              className="w-full space-y-5"
              onSubmit={handleSubmit(values => {
                if (type === 'Generic') {
                  const policies = values.policies.map(policy => {
                    resourceArrRef.current =
                      policy?.resources?.map(resource => resource) || []
                    actionArrRef.current = policy.actions.map(action => action)
                    return {
                      policy_name: policy.policy_name,
                      resources: resourceArrRef.current,
                      actions: actionArrRef.current,
                    }
                  })
                  const data: CreateRoleDTO['data'] = {
                    name: values.name,
                    policies,
                    project_id: projectId,
                    role_type: type,
                  }

                  if (project_id) {
                    data.applicable_to = 'TENANT_DEV'
                  }
                  mutate({ data })
                } else {
                  const policies = values.policies.map(policy => {
                    const deviceArr = policy.devices.map(devices => devices)
                    const eventArr = policy.events.map(events => events)
                    const userArr = policy.users.map(users => users)
                    const orgsArr = policy.orgs.map(orgs => orgs)
                    const group_resources = {
                      groups: [
                        ...deviceArr,
                        ...eventArr,
                        ...userArr,
                        ...orgsArr,
                      ],
                    }
                    actionArrRef.current = policy.actions.map(action => action)
                    return {
                      policy_name: policy.policy_name,
                      group_resources,
                      actions: actionArrRef.current,
                    }
                  })
                  const data: CreateRoleDTO['data'] = {
                    name: values.name,
                    policies,
                    project_id: projectId,
                    role_type: type,
                  }

                  if (project_id) {
                    data.applicable_to = 'TENANT_DEV'
                  }
                  mutate({ data })
                }
              })}
            >
              <>
                <div className="w-fit rounded-2xl bg-slate-200">
                  {roleType.map(item => {
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setValue('role_type', item)
                          setType(item)
                        }}
                        className={cn('px-4 py-2 text-slate-400', {
                          'bg-primary-400 rounded-2xl text-white':
                            type === item,
                        })}
                      >
                        {item}
                      </button>
                    )
                  })}
                </div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:role_manage.add_role.name')}
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
                <div className="flex justify-between space-x-3">
                  <TitleBar
                    title={t('cloud:role_manage.add_policy.title')}
                    className="w-full rounded-md bg-secondary-700 pl-3"
                  />
                  <Button
                    className="rounded-md"
                    variant="trans"
                    size="square"
                    startIcon={
                      <PlusIcon width={16} height={16} viewBox="0 0 16 16" />
                    }
                    onClick={() =>
                      append({
                        policy_name: '',
                        resources: [],
                        devices: [],
                        actions: [],
                        users: [],
                        events: [],
                        orgs: [],
                      })
                    }
                  />
                </div>
                {fields.map((field, index) => (
                  <section
                    className="mt-3 flex justify-between rounded-md bg-slate-200 px-2 py-4"
                    key={field.id}
                  >
                    <div className="grid w-full grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-3">
                      <div className="space-y-1">
                        <FormField
                          control={form.control}
                          name={`policies.${index}.policy_name` as const}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t('cloud:role_manage.add_policy.name')}
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
                      </div>
                      {type === 'Generic' && (
                        <FormField
                          control={form.control}
                          name={`policies.${index}.resources`}
                          render={({
                            field: { onChange, value, ...field },
                          }) => (
                            <FormItem>
                              <FormLabel>
                                {t('cloud:role_manage.add_policy.resources')}
                              </FormLabel>
                              <div>
                                <FormControl>
                                  <NewSelectDropdown
                                    isClearable={true}
                                    customOnChange={onChange}
                                    options={resourcesList}
                                    isMulti
                                    closeMenuOnSelect={false}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />
                      )}
                      {type === 'Group' && (
                        <div className="space-y-3">
                          <FormField
                            control={form.control}
                            name={`policies.${index}.devices`}
                            render={({
                              field: { onChange, value, ...field },
                            }) => (
                              <FormItem>
                                <FormLabel>
                                  {t('sidebar:device.title')}
                                </FormLabel>
                                <div>
                                  <FormControl>
                                    <NewSelectDropdown
                                      isClearable={true}
                                      customOnChange={onChange}
                                      options={groupDataDeviceOptions}
                                      isOptionDisabled={option =>
                                        option.label === t('loading:device') ||
                                        option.label === t('table:no_device')
                                      }
                                      noOptionsMessage={() =>
                                        t('table:no_device')
                                      }
                                      loadingMessage={() => t('loading:device')}
                                      isLoading={isLoadingGroup}
                                      isMulti
                                      closeMenuOnSelect={false}
                                      handleClearSelectDropdown={() =>
                                        form.setValue(
                                          `policies.${index}.devices`,
                                          [],
                                        )
                                      }
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
                            name={`policies.${index}.events`}
                            render={({
                              field: { onChange, value, ...field },
                            }) => (
                              <FormItem>
                                <FormLabel>
                                  {t('cloud:org_manage.event_manage.title')}
                                </FormLabel>
                                <div>
                                  <FormControl>
                                    <NewSelectDropdown
                                      isClearable={true}
                                      customOnChange={onChange}
                                      options={groupDataEventOptions}
                                      isOptionDisabled={option =>
                                        option.label === t('loading:event') ||
                                        option.label === t('table:no_event')
                                      }
                                      noOptionsMessage={() =>
                                        t('table:no_event')
                                      }
                                      loadingMessage={() => t('loading:event')}
                                      isLoading={isLoadingGroup}
                                      isMulti
                                      closeMenuOnSelect={false}
                                      handleClearSelectDropdown={() =>
                                        form.setValue(
                                          `policies.${index}.events`,
                                          [],
                                        )
                                      }
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
                            name={`policies.${index}.users`}
                            render={({
                              field: { onChange, value, ...field },
                            }) => (
                              <FormItem>
                                <FormLabel>
                                  {t('cloud:org_manage.user_manage.title')}
                                </FormLabel>
                                <div>
                                  <FormControl>
                                    <NewSelectDropdown
                                      isClearable={true}
                                      customOnChange={onChange}
                                      options={groupDataUserOptions}
                                      isOptionDisabled={option =>
                                        option.label === t('loading:user') ||
                                        option.label === t('table:no_user')
                                      }
                                      noOptionsMessage={() =>
                                        t('table:no_user')
                                      }
                                      loadingMessage={() => t('loading:user')}
                                      isLoading={isLoadingGroup}
                                      isMulti
                                      closeMenuOnSelect={false}
                                      handleClearSelectDropdown={() =>
                                        form.setValue(
                                          `policies.${index}.users`,
                                          [],
                                        )
                                      }
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
                            name={`policies.${index}.orgs`}
                            render={({
                              field: { onChange, value, ...field },
                            }) => (
                              <FormItem>
                                <FormLabel>
                                  {t('cloud:org_manage.org_manage.title')}
                                </FormLabel>
                                <div>
                                  <FormControl>
                                    <NewSelectDropdown
                                      isClearable={true}
                                      customOnChange={onChange}
                                      options={groupDataOrgOptions}
                                      isOptionDisabled={option =>
                                        option.label === t('loading:org') ||
                                        option.label === t('table:no_org')
                                      }
                                      noOptionsMessage={() => t('table:no_org')}
                                      loadingMessage={() => t('loading:org')}
                                      isLoading={isLoadingGroup}
                                      isMulti
                                      closeMenuOnSelect={false}
                                      handleClearSelectDropdown={() =>
                                        form.setValue(
                                          `policies.${index}.orgs`,
                                          [],
                                        )
                                      }
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                      <FormField
                        control={form.control}
                        name={`policies.${index}.actions`}
                        render={({ field: { onChange, value, ...field } }) => (
                          <FormItem>
                            <FormLabel>
                              {t('cloud:role_manage.add_policy.actions') ??
                                'Authorization actions'}
                            </FormLabel>
                            <div>
                              <FormControl>
                                <NewSelectDropdown
                                  isClearable={true}
                                  customOnChange={onChange}
                                  options={actionsList}
                                  isMulti
                                  closeMenuOnSelect={false}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      size="square"
                      variant="none"
                      className="mt-3 self-start !pr-0"
                      onClick={() => remove(index)}
                      startIcon={
                        <img
                          src={btnDeleteIcon}
                          alt="Delete policy"
                          className="h-10 w-10"
                        />
                      }
                    />
                  </section>
                ))}
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
              form="create-role"
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
