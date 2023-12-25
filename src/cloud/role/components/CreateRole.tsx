import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import { Button } from '~/components/Button'
import { FormDrawer, InputField, SelectDropdown } from '~/components/Form'
import TitleBar from '~/components/Head/TitleBar'
import storage from '~/utils/storage'
import { useCreateRole, type CreateRoleDTO } from '../api'
import { useGetGroups } from '~/cloud/orgManagement/api/groupAPI'
import { cn } from '~/utils/misc'

import { nameSchema } from '~/utils/schemaValidation'
import { type PolicyActions, type PolicyResources } from '../types'

import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { PlusIcon } from '~/components/SVGIcons'

export const resourcesList = [
  { value: 'users', label: 'Người dùng' },
  { value: 'groups', label: 'Nhóm' },
  { value: 'templates', label: 'Mẫu thiết bị' },
  { value: 'events', label: 'Sự kiện' },
  { value: 'organizations', label: 'Tổ chức' },
  { value: 'roles', label: 'Vai trò' },
  { value: 'projects', label: 'Dự án' },
  { value: 'devices', label: 'Thiết bị' },
]

export const actionsList = [
  { value: 'read', label: 'Xem' },
  { value: 'create', label: 'Tạo mới' },
  { value: 'modify', label: 'Chỉnh sửa' },
  { value: 'delete', label: 'Xoá' },
]

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
              .nonempty({ message: 'Vui lòng chọn ít nhất 1 tài nguyên' }),
            actions: z
              .array(z.string())
              .nonempty({ message: 'Vui lòng chọn ít nhất 1 hành động' }),
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
              devices: z.array(z.string()),
              events: z.array(z.string()),
              users: z.array(z.string()),
              orgs: z.array(z.string()),
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

export function CreateRole({ project_id = '' }: { project_id: string }) {
  const { t } = useTranslation()
  const [type, setType] = useState('Generic')

  const roleType = ['Generic', 'Group']

  const {
    register,
    formState,
    handleSubmit,
    control,
    getValues,
    watch,
    setValue,
    reset,
  } = useForm<CreateRoleDTO['data']>({
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

  const { fields, append, remove, replace } = useFieldArray({
    name: 'policies',
    control,
  })

  const dataStorage = storage.getProject()

  let projectId = project_id ? project_id : dataStorage?.id

  const { mutate, isLoading, isSuccess } = useCreateRole()

  const { data: groupData, isLoading: isLoadingGroup } = useGetGroups({
    projectId,
    config: {
      suspense: false,
    },
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

  return (
    <FormDrawer
      isDone={isSuccess}
      resetData={resetData}
      triggerButton={
        <Button
          className="h-9 w-9 rounded-md"
          variant="trans"
          size="square"
          startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
      }
      title={t('cloud:role_manage.add_role.title')}
      submitButton={
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
      }
      size="lg"
    >
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
            const data = {
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
                groups: [...deviceArr, ...eventArr, ...userArr, ...orgsArr],
              }
              actionArrRef.current = policy.actions.map(action => action)
              return {
                policy_name: policy.policy_name,
                group_resources,
                actions: actionArrRef.current,
              }
            })

            const data = {
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
                    'bg-primary-400 rounded-2xl text-white': type === item,
                  })}
                >
                  {item}
                </button>
              )
            })}
          </div>
          <InputField
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
                  <InputField
                    label={t('cloud:role_manage.add_policy.name')}
                    registration={register(
                      `policies.${index}.policy_name` as const,
                    )}
                    error={formState?.errors?.policies?.[index]?.policy_name}
                  />
                </div>
                {type === 'Generic' && (
                  <SelectDropdown
                    label={t('cloud:role_manage.add_policy.resources')}
                    error={formState?.errors?.policies?.[index]?.resources}
                    name={`policies.${index}.resources`}
                    options={resourcesList.map(resourcesType => resourcesType)}
                    control={control}
                    isMulti
                    closeMenuOnSelect={false}
                  />
                )}
                {type === 'Group' && (
                  <div className="space-y-3">
                    <SelectDropdown
                      label={'Thiết bị'}
                      name={`policies.${index}.devices`}
                      control={control}
                      options={groupDataDeviceOptions}
                      isOptionDisabled={option =>
                        option.label === t('loading:device') ||
                        option.label === t('table:no_device')
                      }
                      noOptionsMessage={() => t('table:no_device')}
                      loadingMessage={() => t('loading:device')}
                      isLoading={isLoadingGroup}
                      isMulti
                      closeMenuOnSelect={false}
                      handleClearSelectDropdown={() =>
                        setValue(`policies.${index}.devices`, [])
                      }
                      error={formState?.errors?.policies?.[index]?.root}
                    />

                    <SelectDropdown
                      label={'Sự kiện'}
                      name={`policies.${index}.events`}
                      options={groupDataEventOptions}
                      isOptionDisabled={option =>
                        option.label === t('loading:event') ||
                        option.label === t('table:no_event')
                      }
                      noOptionsMessage={() => t('table:no_event')}
                      loadingMessage={() => t('loading:event')}
                      isLoading={isLoadingGroup}
                      isMulti
                      control={control}
                      closeMenuOnSelect={false}
                      handleClearSelectDropdown={() =>
                        setValue(`policies.${index}.events`, [])
                      }
                      error={formState?.errors?.policies?.[index]?.root}
                    />

                    <SelectDropdown
                      label={'Người dùng'}
                      name={`policies.${index}.users`}
                      options={groupDataUserOptions}
                      isOptionDisabled={option =>
                        option.label === t('loading:user') ||
                        option.label === t('table:no_user')
                      }
                      noOptionsMessage={() => t('table:no_user')}
                      loadingMessage={() => t('loading:user')}
                      isLoading={isLoadingGroup}
                      isMulti
                      control={control}
                      closeMenuOnSelect={false}
                      handleClearSelectDropdown={() =>
                        setValue(`policies.${index}.users`, [])
                      }
                      error={formState?.errors?.policies?.[index]?.root}
                    />

                    <SelectDropdown
                      label={'Tổ chức'}
                      name={`policies.${index}.orgs`}
                      options={groupDataOrgOptions}
                      isOptionDisabled={option =>
                        option.label === t('loading:org') ||
                        option.label === t('table:no_org')
                      }
                      noOptionsMessage={() => t('table:no_org')}
                      loadingMessage={() => t('loading:org')}
                      isLoading={isLoadingGroup}
                      isMulti
                      control={control}
                      closeMenuOnSelect={false}
                      handleClearSelectDropdown={() =>
                        setValue(`policies.${index}.orgs`, [])
                      }
                      error={formState?.errors?.policies?.[index]?.root}
                    />
                  </div>
                )}

                <SelectDropdown
                  label={
                    t('cloud:role_manage.add_policy.actions') ??
                    'Authorization actions'
                  }
                  name={`policies.${index}.actions`}
                  options={actionsList.map(actionsType => actionsType)}
                  control={control}
                  isMulti
                  closeMenuOnSelect={false}
                  error={formState?.errors?.policies?.[index]?.actions}
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
    </FormDrawer>
  )
}
