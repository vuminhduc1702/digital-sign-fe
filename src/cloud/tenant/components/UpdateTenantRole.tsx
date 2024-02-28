import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { useProjects } from '~/cloud/project/api'
import { useGetRoles } from '~/cloud/role/api'
import { Button } from '~/components/Button'
import { Dialog, DialogTitle } from '~/components/Dialog'
import { InputField, SelectDropdown, SelectField } from '~/components/Form'
import {
  useUpdateCustomerRole,
  type UpdateEntityCustomerRoleDTO,
} from '../api/updateTenantRole'
import i18n from '~/i18n'

import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { HiOutlineXMark } from 'react-icons/hi2'

type UpdateCustomerRoleProps = {
  customerId: string
  modalTitle: string
  project_id?: string
  roleIdProps?: string
  isOpenRole: boolean
  closeRole: () => void
}

export const updateEntityCustomerSchema = z.object({
  tenant_id: z.string().optional(),
  project_id: z.string().min(1, {
    message: i18n.t('cloud:project_manager.add_project.choose_project'),
  }),
  role_id: z.string().min(1, {
    message: i18n.t('cloud:role_manage.add_role.choose_role'),
  }),
})

export function UpdateCustomerRole({
  customerId,
  modalTitle,
  project_id,
  roleIdProps,
  closeRole,
  isOpenRole,
}: UpdateCustomerRoleProps) {
  const { t } = useTranslation()
  const cancelButtonRef = useRef(null)

  const { register, formState, handleSubmit, watch, getValues, control } =
    useForm<UpdateEntityCustomerRoleDTO['data']['project_permission'][0]>({
      resolver:
        updateEntityCustomerSchema && zodResolver(updateEntityCustomerSchema),
      defaultValues: {
        tenant_id: customerId,
        project_id: project_id,
        role_id: roleIdProps,
      },
    })
  console.log('formState.errors', formState.errors)

  const { data: projectData, isLoading: projectIsLoading } = useProjects({})
  const projectOptions = projectData?.projects?.map(item => ({
    label: item.name,
    value: item.id,
  }))

  const { data: roleData, isLoading: roleIsLoading } = useGetRoles({
    projectId: watch('project_id'),
    config: {
      enabled: !!watch('project_id'),
    },
  })
  const roleOptions = roleData?.roles?.map(item => ({
    label: item.name,
    value: item.id,
  }))
  console.log('11111111', watch('project_id'))

  const { mutate, isLoading, isSuccess } = useUpdateCustomerRole()

  useEffect(() => {
    if (isSuccess) {
      closeRole()
    }
  }, [isSuccess, closeRole])

  return (
    <Dialog
      isOpen={isOpenRole}
      onClose={() => null}
      initialFocus={cancelButtonRef}
    >
      <div className="inline-block w-80 transform rounded-lg bg-white px-4 pb-4 pt-5">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-h1 text-secondary-900">
              {modalTitle}
            </DialogTitle>
            <div className="ml-3 flex h-7 items-center">
              <button
                className="text-secondary-900 hover:text-secondary-700 focus:ring-secondary-600 rounded-md bg-white focus:outline-none focus:ring-2"
                onClick={closeRole}
              >
                <span className="sr-only">Close panel</span>
                <HiOutlineXMark className="size-6" aria-hidden="true" />
              </button>
            </div>
          </div>
          <form
            id="customer-role-form"
            className="mt-6 flex flex-col justify-between"
            onSubmit={handleSubmit(values => {
              mutate({
                data: {
                  project_permission: [values],
                },
              })
            })}
          >
            <div className="flex flex-col gap-y-5">
              <InputField
                disabled
                registration={register('tenant_id')}
                label={t('form:tenant.title')}
              />

              <SelectDropdown
                label={t('cloud:project_manager.project')}
                name="project_id"
                control={control}
                options={projectOptions}
                isOptionDisabled={option =>
                  option.label === t('loading:project') ||
                  option.label === t('table:no_project')
                }
                noOptionsMessage={() => t('table:no_project')}
                loadingMessage={() => t('loading:project')}
                isLoading={projectIsLoading}
                placeholder={t(
                  'cloud:project_manager.add_project.choose_project',
                )}
                defaultValue={projectOptions?.find(
                  item => item.value === getValues('project_id'),
                )}
                error={formState?.errors?.project_id}
              />

              <SelectDropdown
                label={t('cloud:org_manage.user_manage.add_user.role')}
                name="role_id"
                control={control}
                options={roleOptions}
                isOptionDisabled={option =>
                  option.label === t('loading:role') ||
                  option.label === t('table:no_role')
                }
                noOptionsMessage={() => t('table:no_role')}
                loadingMessage={() => t('loading:role')}
                isLoading={watch('project_id') != null ? roleIsLoading : false}
                placeholder={t('cloud:role_manage.add_role.choose_role')}
                defaultValue={roleOptions?.find(
                  item => item.value === getValues('role_id'),
                )}
                error={formState?.errors?.role_id}
              />
            </div>
          </form>
        </div>
        <div className="mt-4 flex justify-center space-x-2">
          <Button
            type="button"
            variant="secondary"
            className="focus:ring-secondary-700 sm:text-body-sm inline-flex w-full justify-center rounded-md border focus:ring-1 focus:ring-offset-1 sm:mt-0 sm:w-auto"
            onClick={closeRole}
            startIcon={
              <img src={btnCancelIcon} alt="Cancel" className="size-5" />
            }
            ref={cancelButtonRef}
          />
          <Button
            isLoading={isLoading}
            form="customer-role-form"
            type="submit"
            size="md"
            className="bg-primary-400"
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="size-5" />
            }
          />
        </div>
      </div>
    </Dialog>
  )
}
