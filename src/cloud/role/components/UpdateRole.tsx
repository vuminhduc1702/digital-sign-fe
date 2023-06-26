import { useTranslation } from 'react-i18next'
import { useEffect, useRef } from 'react'

import { Button } from '~/components/Button'
import {
  FormMultipleFields,
  InputField,
  SelectDropdown,
} from '~/components/Form'
import { Drawer } from '~/components/Drawer'
import { type UpdateRoleDTO, useUpdateRole } from '../api'
import { actionsList, resourcesList, type roleSchema } from './CreateRole'

import { type Policies, type ActionsType, type ResourcesType } from '../types'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'

type UpdateRoleProps = {
  roleId: string
  name: string
  close: () => void
  isOpen: boolean
  policy: Policies[]
}
export function UpdateRole({
  roleId,
  name,
  close,
  isOpen,
  policy,
}: UpdateRoleProps) {
  const { t } = useTranslation()

  const { mutate, isLoading, isSuccess } = useUpdateRole()

  const resourceArrRef = useRef<ResourcesType['value'][]>([])
  const actionArrRef = useRef<ActionsType['value'][]>([])

  const policiesCurrent: Policies[] = JSON.parse(policy).map(
    (policy: Policies) => {
      return {
        policy_name: policy.policy_name,
        resources: resourcesList.filter(resource =>
          policy.resources.includes(resource.value),
        ),
        actions: actionsList.filter(action =>
          policy.actions.includes(action.value),
        ),
      }
    },
  )

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
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
      <FormMultipleFields<UpdateRoleDTO['data'], typeof roleSchema>
        id="update-role"
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
            },
            roleId,
          })
        }}
        // schema={roleSchema}
        options={{
          defaultValues: { name, policies: policiesCurrent },
        }}
        name={['policies']}
      >
        {({ register, formState, control }, { fields, append, remove }) => {
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
    </Drawer>
  )
}
