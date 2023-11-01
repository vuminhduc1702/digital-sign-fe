import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import { Button } from '~/components/Button'
import {
  FormDrawer,
  FormMultipleFields,
  InputField,
  SelectDropdown,
} from '~/components/Form'
import { type CreateRoleDTO, useCreateRole } from '../api'
import { nameSchema, selectOptionSchema } from '~/utils/schemaValidation'
import TitleBar from '~/components/Head/TitleBar'
import storage from '~/utils/storage'

import { type ActionsType, type ResourcesType } from '../types'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import { cn } from '~/utils/misc'
import { useGetGroups } from '~/cloud/orgManagement/api/groupAPI'
import { useParams } from 'react-router-dom'

export const resourcesList: ResourcesType[] = [
  { value: 'users', label: 'Người dùng' },
  { value: 'groups', label: 'Nhóm' },
  { value: 'templates', label: 'Mãu thiết bị' },
  { value: 'events', label: 'Sự kiện' },
  { value: 'organizations', label: 'Tổ chức' },
  { value: 'roles', label: 'Vai trò' },
  { value: 'projects', label: 'Dự án' },
  { value: 'devices', label: 'Thiết bị' },
]

export const actionsList: ActionsType[] = [
  { value: 'read', label: 'Xem' },
  { value: 'create', label: 'Tạo mới' },
  { value: 'modify', label: 'Chỉnh sửa' },
  { value: 'delete', label: 'Xoá' },
]

export const roleSchema = z
  .object({
    role_type: z.string(),
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
              .array(selectOptionSchema())
              .nonempty({ message: 'Vui lòng chọn ít nhất 1 tài nguyên' }),
            actions: z
              .array(selectOptionSchema())
              .nonempty({ message: 'Vui lòng chọn ít nhất 1 hành động' }),
          }),
        ),
      }),
      z.object({
        role_type: z.literal('Group'),
        policies: z.array(
          z.object({
            policy_name: nameSchema,
            actions: z
              .array(selectOptionSchema())
              .nonempty({ message: 'Vui lòng chọn ít nhất 1 hành động' }),
            devices: z.array(selectOptionSchema()).optional(),
            events: z.array(selectOptionSchema()).optional(),
            users: z.array(selectOptionSchema()).optional(),
            orgs: z.array(selectOptionSchema()).optional(),
          }),
        ),
      }),
    ]),
  )

export function CreateRole() {
  const { t } = useTranslation()
  const [type, setType] = useState('Generic')

  const roleType = ['Generic', 'Group']
  const [offset, setOffset] = useState(0)

  const { id: projectId } = storage.getProject()

  const { mutate, isLoading, isSuccess } = useCreateRole()
  const { data: groupDataDevice } = useGetGroups({
    projectId,
    offset,
    entity_type: 'DEVICE',
    config: { keepPreviousData: true },
  })

  const { data: groupDataEvent } = useGetGroups({
    projectId,
    offset,
    entity_type: 'EVENT',
    config: { keepPreviousData: true },
  })

  const { data: groupDataUser } = useGetGroups({
    projectId,
    offset,
    entity_type: 'USER',
    config: { keepPreviousData: true },
  })

  const { data: groupDataOrg } = useGetGroups({
    projectId,
    offset,
    entity_type: 'ORGANIZATION',
    config: { keepPreviousData: true },
  })

  const resourceArrRef = useRef<ResourcesType['value'][]>([])
  const actionArrRef = useRef<ActionsType['value'][]>([])

  return (
    <FormDrawer
      isDone={isSuccess}
      resetData={() => setType('Generic')}
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
      <FormMultipleFields<CreateRoleDTO['data'], typeof roleSchema>
        id="create-role"
        onSubmit={values => {
          if (type === 'Generic') {
            const policies = values.policies.map(policy => {
              resourceArrRef.current =
                policy?.resources?.map(resource => resource.value) || []
              actionArrRef.current = policy.actions.map(action => action.value)
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
                project_id: projectId,
                role_type: type,
              },
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
              actionArrRef.current = policy.actions.map(action => action.value)
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
                project_id: projectId,
                role_type: type,
              },
            })
          }
        }}
        schema={roleSchema}
        options={{
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
        }}
        name={['policies']}
      >
        {(
          { register, formState, control, setValue },
          { fields, append, remove },
        ) => {
          return (
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
                        'rounded-2xl bg-primary-400 text-white': type === item,
                      })}
                    >
                      {item}
                    </button>
                  )
                })}
              </div>
              <InputField
                label={t('cloud:role_manage.add_role.name') ?? 'Role name'}
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
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <SelectDropdown
                            isClearable={true}
                            label={'Thiết bị'}
                            name={`policies.${index}.devices`}
                            options={
                              groupDataDevice?.groups?.map(groups => ({
                                label: groups?.name,
                                value: groups?.id,
                              })) || [{ label: t('loading:org'), value: '' }]
                            }
                            isMulti
                            control={control}
                            closeMenuOnSelect={false}
                          />
                          <p className="text-body-sm text-primary-400">
                            {
                              formState?.errors?.policies?.[index]?.devices
                                ?.message
                            }
                          </p>
                        </div>
                        <div className="space-y-1">
                          <SelectDropdown
                            isClearable={true}
                            label={'Sự kiện'}
                            name={`policies.${index}.events`}
                            options={
                              groupDataEvent?.groups?.map(groups => ({
                                label: groups?.name,
                                value: groups?.id,
                              })) || [{ label: t('loading:org'), value: '' }]
                            }
                            isMulti
                            control={control}
                            closeMenuOnSelect={false}
                          />
                          <p className="text-body-sm text-primary-400">
                            {
                              formState?.errors?.policies?.[index]?.events
                                ?.message
                            }
                          </p>
                        </div>
                        <div className="space-y-1">
                          <SelectDropdown
                            isClearable={true}
                            label={'Người dùng'}
                            name={`policies.${index}.users`}
                            options={
                              groupDataUser?.groups?.map(groups => ({
                                label: groups?.name,
                                value: groups?.id,
                              })) || [{ label: t('loading:org'), value: '' }]
                            }
                            isMulti
                            control={control}
                            closeMenuOnSelect={false}
                          />
                          <p className="text-body-sm text-primary-400">
                            {
                              formState?.errors?.policies?.[index]?.users
                                ?.message
                            }
                          </p>
                        </div>
                        <div className="space-y-1">
                          <SelectDropdown
                            isClearable={true}
                            label={'Tổ chức'}
                            name={`policies.${index}.orgs`}
                            options={
                              groupDataOrg?.groups?.map(groups => ({
                                label: groups?.name,
                                value: groups?.id,
                              })) || [{ label: t('loading:org'), value: '' }]
                            }
                            isMulti
                            control={control}
                            closeMenuOnSelect={false}
                          />
                          <p className="text-body-sm text-primary-400">
                            {
                              formState?.errors?.policies?.[index]?.orgs
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
          )
        }}
      </FormMultipleFields>
    </FormDrawer>
  )
}
