import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import { Button } from '~/components/Button'
import {
  FormDrawer,
  FormMultipleFields,
  InputField,
  SelectField,
  SelectMultiple,
} from '~/components/Form'
import { useProjectIdStore } from '~/stores/project'
import { type CreateRoleDTO, useCreateRole } from '../api'
import { nameSchema } from '~/utils/schemaValidation'

import { type PolicyActions, type PolicyResources } from '../types'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

type ResourcesType = {
  type: PolicyResources
  name: string
}

type ActionsType = {
  type: PolicyActions
  name: string
}

export const resourcesList: ResourcesType[] = [
  { type: 'users', name: 'Người dùng' },
  { type: 'groups', name: 'Nhóm' },
  { type: 'templates', name: 'Mãu thiết bị' },
  { type: 'events', name: 'Sự kiện' },
  { type: 'organizations', name: 'Tổ chức' },
  { type: 'roles', name: 'Vai trò' },
  { type: 'projects', name: 'Dự án' },
  { type: 'devices', name: 'Thiết bị' },
]

export const actionsList: ActionsType[] = [
  { type: 'read', name: 'Xem' },
  { type: 'write', name: 'Tạo mới' },
  { type: 'modify', name: 'Chỉnh sửa' },
  { type: 'delete', name: 'Xoá' },
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

export default function CreateRole() {
  const { t } = useTranslation()

  const projectId = useProjectIdStore(state => state.projectId)

  const { mutate, isLoading, isSuccess } = useCreateRole()

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
      title={t('cloud.role_manage.add_role.title')}
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
        onSubmit={values =>
          mutate({ data: { ...values, project_id: projectId } })
        }
        schema={roleSchema}
        options={{
          defaultValues: {
            name: '',
            policies: [{ policy_name: '', resources: [], actions: [] }],
          },
        }}
        name="policies"
      >
        {(register, formState, fields, append, remove, control) => (
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
              label={t('cloud.role_manage.add_role.name') ?? 'Role name'}
              error={formState.errors['name']}
              registration={register('name')}
            />
            {fields.map((field, index) => (
              <section key={field.id}>
                <InputField
                  label={t('cloud.role_manage.add_policy.name') ?? 'Policy'}
                  error={formState.errors[`policies.${index}.policy_name`]}
                  registration={register(
                    `policies.${index}.policy_name` as const,
                  )}
                />
                {/* <SelectField
                  label={
                    t('cloud.role_manage.add_policy.resources') ??
                    'Authorization resources'
                  }
                  error={formState.errors[`policies.${index}.resources`]}
                  registration={register(
                    `policies.${index}.resources.0` as const,
                  )}
                  options={resourcesList.map(resourcesType => ({
                    label: resourcesType.name,
                    value: resourcesType.type,
                  }))}
                /> */}
                <SelectMultiple
                  name={`resources.0`}
                  options={resourcesList.map(resourcesType => ({
                    label: resourcesType.name,
                    value: resourcesType.type,
                  }))}
                  control={control}
                />
                <SelectField
                  label={
                    t('cloud.role_manage.add_policy.actions') ??
                    'Authorization actions'
                  }
                  error={formState.errors[`policies.${index}.actions`]}
                  registration={register(
                    `policies.${index}.actions.0` as const,
                  )}
                  options={actionsList.map(actionsType => ({
                    label: actionsType.name,
                    value: actionsType.type,
                  }))}
                />
                <button type="button" onClick={() => remove(index)}>
                  X
                </button>
              </section>
            ))}
          </>
        )}
      </FormMultipleFields>
    </FormDrawer>
  )
}
