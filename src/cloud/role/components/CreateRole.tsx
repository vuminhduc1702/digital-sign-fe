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
import { type CreateRoleDTO, useCreateRole } from '../api'
import { nameSchema, selectOptionSchema } from '~/utils/schemaValidation'
import TitleBar from '~/components/Head/TitleBar'
import storage from '~/utils/storage'

import { type ActionsType, type ResourcesType } from '../types'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'

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
      resources: z
        .array(selectOptionSchema())
        .nonempty({ message: 'Vui lòng chọn ít nhất 1 tài nguyên' }),
      actions: z
        .array(selectOptionSchema())
        .nonempty({ message: 'Vui lòng chọn ít nhất 1 hành động' }),
    }),
  ),
})

export function CreateRole() {
  const { t } = useTranslation()

  const { id: projectId } = storage.getProject()

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
          // console.log('values', values)
          const policies = values.policies.map(policy => {
            resourceArrRef.current = policy.resources.map(
              // @ts-ignore
              resource => resource.value,
            )
            // @ts-ignore
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
        schema={roleSchema}
        options={{
          defaultValues: {
            name: '',
            policies: [{ policy_name: '', resources: [], actions: [] }],
          },
        }}
        name={['policies']}
      >
        {({ register, formState, control }, { fields, append, remove }) => {
          console.log('errors zod: ', formState.errors)
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
                  className="w-full rounded-md bg-gray-500 pl-3"
                />
                <Button
                  className="rounded-md"
                  variant="trans"
                  size="square"
                  startIcon={
                    <PlusIcon width={16} height={16} viewBox="0 0 16 16" />
                  }
                  onClick={() =>
                    append({ policy_name: '', resources: [], actions: [] })
                  }
                />
              </div>
              {fields.map((field, index) => (
                <section
                  className="flex justify-between gap-x-2"
                  style={{ marginTop: 10 }}
                  key={field.id}
                >
                  <div className="space-y-1">
                    <InputField
                      label={t('cloud:role_manage.add_policy.name')}
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
                  <div className="space-y-1">
                    <SelectDropdown
                      isClearable={true}
                      label={t('cloud:role_manage.add_policy.resources')}
                      name={`policies.${index}.resources`}
                      options={resourcesList.map(
                        resourcesType => resourcesType,
                      )}
                      control={control}
                      isMulti
                      closeMenuOnSelect={false}
                    />
                    <p className="text-body-sm text-primary-400">
                      {formState?.errors?.policies?.[index]?.actions?.message}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <SelectDropdown
                      isClearable={true}
                      label={t('cloud:role_manage.add_policy.actions')}
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
                  <Button
                    type="button"
                    size="square"
                    variant="none"
                    className="mt-0 self-start"
                    onClick={() => remove(index)}
                    startIcon={
                      <img
                        src={btnDeleteIcon}
                        alt="Delete condition"
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
