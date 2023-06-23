import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import { Button } from '~/components/Button'
import {
  FormDrawer,
  FormMultipleFields,
  InputField,
  SelectDropdown,
} from '~/components/Form'
import { useProjectIdStore } from '~/stores/project'
import { type CreateRoleDTO, useCreateRole } from '../api'
import { nameSchema } from '~/utils/schemaValidation'

import { type ActionsType, type ResourcesType } from '../types'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

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

export const roleSchema = z.object({
  name: nameSchema,
  policies: z.array(
    z.object({
      policy_name: nameSchema,
      resources: z.array(z.string()),
      actions: z.array(z.string()),
    }),
  ),
})

export function CreateRole() {
  const { t } = useTranslation()

  const projectId = useProjectIdStore(state => state.projectId)

  const { mutate, isLoading, isSuccess } = useCreateRole()

  const resourceArrRef = useRef<ResourcesType['value'][]>([])
  const actionArrRef = useRef<ActionsType['value'][]>([])

  return (
    <FormDrawer
      isDone={isSuccess}
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
    >
      <FormMultipleFields<CreateRoleDTO['data'], typeof roleSchema>
        id="create-role"
        onSubmit={values => {
          const policies = values.policies.map(policy => {
            resourceArrRef.current = policy.resources.map(
              resource => resource.value,
            )
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
            },
          })
        }}
        // TODO: fix role's schema validation
        // schema={roleSchema}
        options={{
          defaultValues: {
            name: '',
            policies: [{ policy_name: '', resources: [], actions: [] }],
          },
        }}
        name="policies"
      >
        {(register, formState, fields, append, remove, control) => {
          // console.log('errors zod: ', formState.errors)
          return (
            <>
              <button
                type="button"
                onClick={() =>
                  append({ policy_name: '', resources: [], actions: [] })
                }
              >
                APPEND
              </button>
              <InputField
                label={t('cloud:role_manage.add_role.name') ?? 'Role name'}
                error={formState.errors['name']}
                registration={register('name')}
              />
              {fields.map((field, index) => (
                <section className="space-y-2" key={field.id}>
                  <InputField
                    label={t('cloud:role_manage.add_policy.name') ?? 'Policy'}
                    registration={register(
                      `policies.${index}.policy_name` as const,
                    )}
                  />
                  <p className="text-body-sm text-primary-400">
                    {formState?.errors?.policies?.[index]?.policy_name?.message}
                  </p>
                  <SelectDropdown
                    label={
                      t('cloud:role_manage.add_policy.resources') ??
                      'Authorization resources'
                    }
                    name={`policies.${index}.resources`}
                    options={resourcesList.map(resourcesType => resourcesType)}
                    control={control}
                    isMulti
                    closeMenuOnSelect={false}
                  />
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
                  />
                  <button type="button" onClick={() => remove(index)}>
                    X
                  </button>
                </section>
              ))}
            </>
          )
        }}
      </FormMultipleFields>
    </FormDrawer>
  )
}
