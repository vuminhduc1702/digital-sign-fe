import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSpinDelay } from 'spin-delay'

import { Button } from '~/components/Button'
import { Drawer } from '~/components/Drawer'
import {
  FormMultipleFields,
  InputField,
  SelectDropdown,
} from '~/components/Form'

import { Spinner } from '~/components/Spinner'
import { useGetGroups } from '~/cloud/orgManagement/api/groupAPI'
import TitleBar from '~/components/Head/TitleBar'
import storage from '~/utils/storage'

import { type ActionsType, type Policies, type ResourcesType } from '../types'

import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { PlusIcon } from '~/components/SVGIcons'
import { useDevRoleById } from '../api/getDevRoleById'
import { type UpdateDevRoleDTO, useUpdateDevRole } from '../api'
import { roleSchema } from './CreateDevRole'

type UpdateRoleProps = {
  roleId: string
  name: string
  close: () => void
  isOpen: boolean
  policy: Policies[]
  role_type: string
}
export function UpdateDevRole({
  roleId,
  name,
  close,
  isOpen,
  role_type,
}: UpdateRoleProps) {
  const { t } = useTranslation()
  const [type, setType] = useState(role_type ? 'Group' : 'Generic')

  const { data: roleByIdData, isLoading: roleByIdIsLoading } = useDevRoleById({
    roleId,
    config: {
      suspense: false,
    },
  })

  const { id: projectId } = storage.getProject()

  const { mutate, isLoading, isSuccess } = useUpdateDevRole()

  const resourceArrRef = useRef<ResourcesType['value'][]>([])
  const actionArrRef = useRef<ActionsType['value'][]>([])

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
  })) || [{ label: t('loading:org'), value: '' }]

  const groupDataEventOptons = groupDataEvent?.groups?.map(groups => ({
    label: groups?.name,
    value: groups?.id,
  })) || [{ label: t('loading:org'), value: '' }]

  const groupDataUserOptons = groupDataUser?.groups?.map(groups => ({
    label: groups?.name,
    value: groups?.id,
  })) || [{ label: t('loading:org'), value: '' }]

  const groupDataOrgOptons = groupDataOrg?.groups?.map(groups => ({
    label: groups?.name,
    value: groups?.id,
  })) || [{ label: t('loading:org'), value: '' }]

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  const policiesCurrent: Policies[] =
    roleByIdData?.policies?.map((policy: Policies) => {
      if (role_type) {
        const groups = policy?.group_resources?.groups
        const deviceArr = groupDataDeviceOptons.filter(devices =>
          groups?.includes(devices.value),
        )
        const userArr = groupDataUserOptons.filter(users =>
          groups?.includes(users.value),
        )
        const eventArr = groupDataEventOptons.filter(events =>
          groups?.includes(events.value),
        )
        const orgArr = groupDataOrgOptons.filter(orgs =>
          groups?.includes(orgs.value),
        )
        return {
          policy_name: policy.policy_name,
          devices: deviceArr,
          users: userArr,
          events: eventArr,
          orgs: orgArr,
          actions: actionsList.filter(action =>
            policy.actions.includes(action.value),
          ),
          resources: [],
        }
      } else {
        return {
          policy_name: policy.policy_name,
          resources: resourcesList.filter(resource =>
            policy?.resources?.includes(resource.value),
          ),
          devices: [],
          users: [],
          events: [],
          orgs: [],
          actions: actionsList.filter(action =>
            policy.actions.includes(action.value),
          ),
        }
      }
    }) || []

  const showSpinner = useSpinDelay(roleByIdIsLoading, {
    delay: 150,
    minDuration: 300,
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
            form="update-dev-role"
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
      {roleByIdIsLoading ? (
        <div className="flex grow items-center justify-center">
          <Spinner showSpinner={showSpinner} size="xl" />
        </div>
      ) : (
        <FormMultipleFields<UpdateDevRoleDTO['data'], typeof roleSchema>
          id="update-dev-role"
          onSubmit={values => {
            if (type === 'Generic') {
              const policies = values.policies.map(policy => {
                resourceArrRef.current =
                  policy?.resources?.map(resource => resource.value) || []
                actionArrRef.current = policy.actions.map(
                  action => action.value,
                )
                return {
                  policy_name: policy.policy_name,
                  resources: resourceArrRef.current,
                  actions: actionArrRef.current,
                }
              })
              mutate({
                data: {
                  name: values.name,
                  policies,
                  role_type: type,
                },
                roleId,
              })
            } else {
              const policies = values.policies.map(policy => {
                const deviceArr = policy.devices.map(devices => devices?.value)
                const eventArr = policy.events.map(events => events?.value)
                const userArr = policy.users.map(users => users?.value)
                const orgsArr = policy.orgs.map(orgs => orgs?.value)

                const group_resources = {
                  groups: [...deviceArr, ...eventArr, ...userArr, ...orgsArr],
                }
                actionArrRef.current = policy.actions.map(
                  action => action.value,
                )
                return {
                  policy_name: policy.policy_name,
                  group_resources,
                  actions: actionArrRef.current,
                }
              })
              mutate({
                data: {
                  name: values.name,
                  policies,
                  role_type: type,
                },
                roleId,
              })
            }
          }}
          schema={roleSchema}
          options={{
            defaultValues: {
              name,
              policies: policiesCurrent,
              role_type: role_type ? 'Group' : 'Generic',
            },
          }}
          name={['policies']}
        >
          {(
            { register, formState, control, setValue },
            { fields, append, remove },
          ) => {
            return (
              <>
                <InputField
                  label={t('cloud:role_manage.add_role.name') ?? 'Role name'}
                  error={formState.errors['name']}
                  registration={register('name')}
                />
                <div className="flex justify-between space-x-3">
                  <TitleBar
                    title={t('cloud:role_manage.add_policy.title')}
                    className="bg-secondary-700 w-full rounded-md pl-3"
                  />
                  <Button
                    className="text-secondary-700 rounded-md"
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
                        <InputField
                          label={
                            t('cloud:role_manage.add_policy.name') ?? 'Policy'
                          }
                          registration={register(
                            `policies.${index}.policy_name` as const,
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
                        <div className="space-y-1">
                          <SelectDropdown
                            isClearable={true}
                            label={
                              t('cloud:role_manage.add_policy.resources') ??
                              'Authorization resources'
                            }
                            name={`policies.${index}.resources`}
                            options={resourcesList.map(
                              resourcesType => resourcesType,
                            )}
                            control={control}
                            isMulti
                            closeMenuOnSelect={false}
                          />
                          <p className="text-body-sm text-primary-400">
                            {
                              formState?.errors?.policies?.[index]?.resources
                                ?.message
                            }
                          </p>
                        </div>
                      )}
                      {type === 'Group' && (
                        <div>
                          <div className="space-y-1">
                            <SelectDropdown
                              isClearable={true}
                              label={'Thiết bị'}
                              name={`policies.${index}.devices`}
                              options={groupDataDeviceOptons}
                              isMulti
                              control={control}
                              closeMenuOnSelect={false}
                            />
                            <p className="text-body-sm text-primary-400">
                              {
                                formState?.errors?.policies?.[index]?.root
                                  ?.message
                              }
                            </p>
                          </div>
                          <div className="space-y-1">
                            <SelectDropdown
                              isClearable={true}
                              label={'Sự kiện'}
                              name={`policies.${index}.events`}
                              options={groupDataEventOptons}
                              isMulti
                              control={control}
                              closeMenuOnSelect={false}
                            />
                            <p className="text-body-sm text-primary-400">
                              {
                                formState?.errors?.policies?.[index]?.root
                                  ?.message
                              }
                            </p>
                          </div>
                          <div className="space-y-1">
                            <SelectDropdown
                              isClearable={true}
                              label={'Người dùng'}
                              name={`policies.${index}.users`}
                              options={groupDataUserOptons}
                              isMulti
                              control={control}
                              closeMenuOnSelect={false}
                            />
                            <p className="text-body-sm text-primary-400">
                              {
                                formState?.errors?.policies?.[index]?.root
                                  ?.message
                              }
                            </p>
                          </div>
                          <div className="space-y-1">
                            <SelectDropdown
                              isClearable={true}
                              label={'Tổ chức'}
                              name={`policies.${index}.orgs`}
                              options={groupDataOrgOptons}
                              isMulti
                              control={control}
                              closeMenuOnSelect={false}
                            />
                            <p className="text-body-sm text-primary-400">
                              {
                                formState?.errors?.policies?.[index]?.root
                                  ?.message
                              }
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="space-y-1">
                        <SelectDropdown
                          isClearable={true}
                          label={
                            t('cloud:role_manage.add_policy.actions') ??
                            'Authorization actions'
                          }
                          name={`policies.${index}.actions`}
                          options={actionsList.map(actionsType => actionsType)}
                          control={control}
                          isMulti
                          closeMenuOnSelect={false}
                        />
                        <p className="text-body-sm text-primary-400">
                          {
                            formState?.errors?.policies?.[index]?.actions
                              ?.message
                          }
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
            )
          }}
        </FormMultipleFields>
      )}
    </Drawer>
  )
}
