import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useGetGroups } from '@/cloud/orgManagement/api/groupAPI'
import { Button } from '@/components/ui/button'
import TitleBar from '@/components/Head/TitleBar'
import storage from '@/utils/storage'
import { useUpdateRole, type UpdateRoleDTO } from '../api'
import { actionsList, resourcesList, roleSchema } from './CreateRole'

import { type Policies } from '../types'

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
import { NewSelectDropdown } from '@/components/Form/NewSelectDropdown'

type UpdateRoleProps = {
  roleId: string
  name: string
  close: () => void
  isOpen: boolean
  policy: Policies[]
  role_type: string
  project_id: string
}

export function UpdateRole({
  roleId,
  name,
  close,
  isOpen,
  policy,
  role_type,
  project_id = '',
}: UpdateRoleProps) {
  const { t } = useTranslation()

  const [type] = useState(role_type ? 'Group' : 'Generic')

  const projectId = project_id || storage.getProject()?.id

  const { mutate, isLoading, isSuccess } = useUpdateRole()

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

  useEffect(() => {
    if (isSuccess && close) {
      close()
    }
  }, [isSuccess])

  const resetForm = () => {
    close()
    form.reset()
  }

  const policiesCurrent =
    policy?.map((policy: Policies) => {
      if (role_type) {
        const groups = policy?.group_resources?.groups
        const deviceArr = groupDataDeviceOptions
          ?.filter(devices => groups?.includes(devices.value))
          .map(item => item.value)
        const userArr = groupDataUserOptions
          ?.filter(users => groups?.includes(users.value))
          .map(item => item.value)
        const eventArr = groupDataEventOptions
          ?.filter(events => groups?.includes(events.value))
          .map(item => item.value)
        const orgArr = groupDataOrgOptions
          ?.filter(orgs => groups?.includes(orgs.value))
          .map(item => item.value)
        return {
          policy_name: policy.policy_name,
          devices: deviceArr,
          users: userArr,
          events: eventArr,
          orgs: orgArr,
          actions: actionsList
            .filter(action => policy.actions.includes(action.value))
            .map(item => item.value),
          resources: [],
        }
      } else {
        return {
          policy_name: policy.policy_name,
          resources: resourcesList
            .filter(resource => policy?.resources?.includes(resource.value))
            .map(item => item.value),
          devices: [],
          users: [],
          events: [],
          orgs: [],
          actions: actionsList
            .filter(action => {
              return policy.actions.includes(action.value)
            })
            .map(item => item.value),
        }
      }
    }) || []

  const form = useForm<UpdateRoleDTO['data']>({
    resolver: roleSchema && zodResolver(roleSchema),
    defaultValues: {
      name,
      policies: policiesCurrent,
      role_type: type,
    },
  })
  const { formState, handleSubmit, control, getValues, setValue } = form

  const { fields, append, remove } = useFieldArray({
    name: 'policies',
    control,
  })

  return (
    <Sheet open={isOpen} onOpenChange={resetForm} modal={false}>
      <SheetContent
        onInteractOutside={e => {
          e.preventDefault()
        }}
        className={cn('flex h-full max-w-4xl flex-col justify-between')}
      >
        <SheetHeader>
          <SheetTitle>{t('cloud:role_manage.add_role.edit')}</SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
          <Form {...form}>
            <form
              id="update-role"
              className="w-full space-y-5"
              onSubmit={handleSubmit(values => {
                let policyParams
                if (type === 'Generic') {
                  policyParams = values.policies
                } else {
                  policyParams = values.policies.map(item => {
                    return {
                      actions: item.actions,
                      policy_name: item.policy_name,
                      group_resources: {
                        groups: [
                          ...item.devices,
                          ...item.events,
                          ...item.orgs,
                          ...item.users,
                        ],
                      },
                    }
                  })
                }

                mutate({
                  data: {
                    name: values.name,
                    policies: policyParams,
                    role_type: type,
                  },
                  roleId,
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
                    className="rounded-md text-secondary-700"
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
                    key={field?.id ? field?.id : `update-role-key-${index}`}
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
                        <p className="text-body-sm text-primary-400">
                          {
                            formState?.errors?.policies?.[index]?.policy_name
                              ?.message
                          }
                        </p>
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
                                    defaultValue={resourcesList.filter(item =>
                                      getValues(
                                        `policies.${index}.resources`,
                                      )?.includes(item.value),
                                    )}
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
                                  {t('cloud:org_manage.device_manage.title')}
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
                                      defaultValue={groupDataDeviceOptions?.filter(
                                        item =>
                                          getValues(
                                            `policies.${index}.devices`,
                                          )?.includes(item.value),
                                      )}
                                      handleClearSelectDropdown={() =>
                                        setValue(
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
                                      defaultValue={groupDataEventOptions?.filter(
                                        item =>
                                          getValues(
                                            `policies.${index}.events`,
                                          )?.includes(item.value),
                                      )}
                                      handleClearSelectDropdown={() =>
                                        setValue(`policies.${index}.events`, [])
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
                                      defaultValue={groupDataUserOptions?.filter(
                                        item =>
                                          getValues(
                                            `policies.${index}.users`,
                                          )?.includes(item.value),
                                      )}
                                      handleClearSelectDropdown={() =>
                                        setValue(`policies.${index}.users`, [])
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
                                      defaultValue={groupDataOrgOptions?.filter(
                                        item =>
                                          getValues(
                                            `policies.${index}.orgs`,
                                          )?.includes(item.value),
                                      )}
                                      handleClearSelectDropdown={() =>
                                        setValue(`policies.${index}.orgs`, [])
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
                                  defaultValue={actionsList.filter(item =>
                                    getValues(
                                      `policies.${index}.actions`,
                                    )?.includes(item.value),
                                  )}
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
              form="update-role"
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
