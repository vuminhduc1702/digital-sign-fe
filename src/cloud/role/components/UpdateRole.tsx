import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useGetGroups } from '~/cloud/orgManagement/api/groupAPI'
import { Button } from '~/components/Button'
import { Drawer } from '~/components/Drawer'
import { InputField, SelectDropdown } from '~/components/Form'
import TitleBar from '~/components/Head/TitleBar'
import storage from '~/utils/storage'
import { useUpdateRole, type UpdateRoleDTO } from '../api'
import { actionsList, resourcesList, roleSchema } from './CreateRole'

import { type Policies } from '../types'

import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { PlusIcon } from '~/components/SVGIcons'

type UpdateRoleProps = {
  roleId: string
  name: string
  close: () => void
  isOpen: boolean
  policy: string
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

  const { data: groupDataDevice } = useGetGroups({
    projectId,
    entity_type: 'DEVICE',
    config: {
      suspense: false,
    },
  })

  const { data: groupDataEvent } = useGetGroups({
    projectId,
    entity_type: 'EVENT',
    config: {
      suspense: false,
    },
  })

  const { data: groupDataUser } = useGetGroups({
    projectId,
    entity_type: 'USER',
    config: {
      suspense: false,
    },
  })

  const { data: groupDataOrg } = useGetGroups({
    projectId,
    entity_type: 'ORGANIZATION',
    config: {
      suspense: false,
    },
  })

  const groupDataDeviceOptons = groupDataDevice?.groups?.map(groups => ({
    label: groups?.name,
    value: groups?.id,
  })) || [{ label: t('loading:group'), value: '' }]

  const groupDataEventOptons = groupDataEvent?.groups?.map(groups => ({
    label: groups?.name,
    value: groups?.id,
  })) || [{ label: t('loading:group'), value: '' }]

  const groupDataUserOptons = groupDataUser?.groups?.map(groups => ({
    label: groups?.name,
    value: groups?.id,
  })) || [{ label: t('loading:group'), value: '' }]

  const groupDataOrgOptons = groupDataOrg?.groups?.map(groups => ({
    label: groups?.name,
    value: groups?.id,
  })) || [{ label: t('loading:group'), value: '' }]

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  const policiesCurrent: Policies[] =
    JSON.parse(policy).map((policy: Policies) => {
      if (role_type) {
        const groups = policy?.group_resources?.groups
        const deviceArr = groupDataDeviceOptons
          .filter(devices => groups?.includes(devices.value))
          .map(item => item.value)
        const userArr = groupDataUserOptons
          .filter(users => groups?.includes(users.value))
          .map(item => item.value)
        const eventArr = groupDataEventOptons
          .filter(events => groups?.includes(events.value))
          .map(item => item.value)
        const orgArr = groupDataOrgOptons
          .filter(orgs => groups?.includes(orgs.value))
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

  const {
    register,
    formState,
    handleSubmit,
    control,
    getValues,
    watch,
    setValue,
  } = useForm<UpdateRoleDTO['data']>({
    resolver: roleSchema && zodResolver(roleSchema),
    defaultValues: {
      name,
      policies: policiesCurrent,
      role_type: type,
    },
  })

  const { fields, append, remove } = useFieldArray({
    name: 'policies',
    control,
  })

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      size="lg"
      title={t('cloud:role_manage.add_role.edit')}
      renderFooter={() => (
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
            form="update-role"
            type="submit"
            size="lg"
            isLoading={isLoading}
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
          />
        </>
      )}
    >
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
          <InputField
            className={
              !!formState.errors['name']
                ? 'border-primary-400 focus:outline-primary-400'
                : ''
            }
            label={t('cloud:role_manage.add_role.name')}
            error={formState.errors['name']}
            registration={register('name')}
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
                  <InputField
                    className={
                      !!formState?.errors?.policies?.[index]?.policy_name
                        ?.message
                        ? 'border-primary-400 focus:outline-primary-400'
                        : ''
                    }
                    label={t('cloud:role_manage.add_policy.name')}
                    registration={register(
                      `policies.${index}.policy_name` as const,
                    )}
                  />
                  <p className="text-body-sm text-primary-400">
                    {formState?.errors?.policies?.[index]?.policy_name?.message}
                  </p>
                </div>
                {type === 'Generic' && (
                  <div className="space-y-1">
                    <SelectDropdown
                      isErrorSelect={
                        !!formState?.errors?.policies?.[index]?.resources
                          ?.message
                      }
                      label={t('cloud:role_manage.add_policy.resources')}
                      name={`policies.${index}.resources`}
                      options={resourcesList}
                      control={control}
                      isMulti
                      closeMenuOnSelect={false}
                      defaultValue={resourcesList.filter(item =>
                        getValues(`policies.${index}.resources`)?.includes(
                          item.value,
                        ),
                      )}
                    />
                    <p className="text-body-sm text-primary-400">
                      {formState?.errors?.policies?.[index]?.resources?.message}
                    </p>
                  </div>
                )}
                {type === 'Group' && (
                  <div>
                    <div className="space-y-1">
                      <SelectDropdown
                        isErrorSelect={
                          !!formState?.errors?.policies?.[index]?.root?.message
                        }
                        label={t('cloud:org_manage.device_manage.title')}
                        name={`policies.${index}.devices`}
                        options={groupDataDeviceOptons}
                        isMulti
                        control={control}
                        closeMenuOnSelect={false}
                        defaultValue={groupDataDeviceOptons.filter(item =>
                          getValues(`policies.${index}.devices`)?.includes(
                            item.value,
                          ),
                        )}
                        handleClearSelectDropdown={() =>
                          setValue(`policies.${index}.devices`, [])
                        }
                      />
                      <p className="text-body-sm text-primary-400">
                        {formState?.errors?.policies?.[index]?.root?.message}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <SelectDropdown
                        isErrorSelect={
                          !!formState?.errors?.policies?.[index]?.root?.message
                        }
                        label={t('cloud:org_manage.event_manage.title')}
                        name={`policies.${index}.events`}
                        options={groupDataEventOptons}
                        isMulti
                        control={control}
                        closeMenuOnSelect={false}
                        defaultValue={groupDataEventOptons.filter(item =>
                          getValues(`policies.${index}.events`)?.includes(
                            item.value,
                          ),
                        )}
                        handleClearSelectDropdown={() =>
                          setValue(`policies.${index}.events`, [])
                        }
                      />
                      <p className="text-body-sm text-primary-400">
                        {formState?.errors?.policies?.[index]?.root?.message}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <SelectDropdown
                        isErrorSelect={
                          !!formState?.errors?.policies?.[index]?.root?.message
                        }
                        label={t('cloud:org_manage.user_manage.title')}
                        name={`policies.${index}.users`}
                        options={groupDataUserOptons}
                        isMulti
                        control={control}
                        closeMenuOnSelect={false}
                        defaultValue={groupDataUserOptons.filter(item =>
                          getValues(`policies.${index}.users`)?.includes(
                            item.value,
                          ),
                        )}
                        handleClearSelectDropdown={() =>
                          setValue(`policies.${index}.users`, [])
                        }
                      />
                      <p className="text-body-sm text-primary-400">
                        {formState?.errors?.policies?.[index]?.root?.message}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <SelectDropdown
                        isErrorSelect={
                          !!formState?.errors?.policies?.[index]?.root?.message
                        }
                        label={t('cloud:org_manage.org_manage.title')}
                        name={`policies.${index}.orgs`}
                        options={groupDataOrgOptons}
                        isMulti
                        control={control}
                        closeMenuOnSelect={false}
                        defaultValue={groupDataOrgOptons.filter(item =>
                          getValues(`policies.${index}.orgs`)?.includes(
                            item.value,
                          ),
                        )}
                        handleClearSelectDropdown={() =>
                          setValue(`policies.${index}.orgs`, [])
                        }
                      />
                      <p className="text-body-sm text-primary-400">
                        {formState?.errors?.policies?.[index]?.root?.message}
                      </p>
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <SelectDropdown
                    isErrorSelect={
                      !!formState?.errors?.policies?.[index]?.actions?.message
                    }
                    label={t('cloud:role_manage.add_policy.actions')}
                    name={`policies.${index}.actions`}
                    options={actionsList}
                    control={control}
                    isMulti
                    closeMenuOnSelect={false}
                    defaultValue={actionsList.filter(item =>
                      getValues(`policies.${index}.actions`)?.includes(
                        item.value,
                      ),
                    )}
                  />
                  <p className="text-body-sm text-primary-400">
                    {formState?.errors?.policies?.[index]?.actions?.message}
                  </p>
                </div>
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
    </Drawer>
  )
}
