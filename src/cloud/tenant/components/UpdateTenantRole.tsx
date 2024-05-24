import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { useProjects } from '@/cloud/project/api'
import { useGetRoles } from '@/cloud/role/api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import {
  useUpdateCustomerRole,
  type UpdateEntityCustomerRoleDTO,
} from '../api/updateTenantRole'
import i18n from '@/i18n'

import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { HiOutlineXMark } from 'react-icons/hi2'
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

  const form = useForm<
    UpdateEntityCustomerRoleDTO['data']['project_permission'][0]
  >({
    resolver:
      updateEntityCustomerSchema && zodResolver(updateEntityCustomerSchema),
    defaultValues: {
      tenant_id: customerId,
      project_id: project_id ? project_id : '',
      role_id: roleIdProps ? roleIdProps : '',
    },
  })
  const { handleSubmit, watch, getValues } = form

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

  const { mutate, isLoading, isSuccess } = useUpdateCustomerRole()

  useEffect(() => {
    if (isSuccess) {
      closeRole()
    }
  }, [isSuccess, closeRole])

  const resetForm = () => {
    closeRole()
    form.reset()
  }

  return (
    <Dialog
      isOpen={isOpenRole}
      onClose={resetForm}
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
                className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                onClick={resetForm}
              >
                <span className="sr-only">Close panel</span>
                <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
          <Form {...form}>
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
                <FormField
                  control={form.control}
                  name="tenant_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form:tenant.title')}</FormLabel>
                      <div>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="project_id"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:project_manager.project')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <NewSelectDropdown
                            isClearable={true}
                            customOnChange={onChange}
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
                  name="role_id"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>
                        {t('cloud:org_manage.user_manage.add_user.role')}
                      </FormLabel>
                      <div>
                        <FormControl>
                          <NewSelectDropdown
                            isClearable={true}
                            customOnChange={onChange}
                            options={roleOptions}
                            isOptionDisabled={option =>
                              option.label === t('loading:role') ||
                              option.label === t('table:no_role')
                            }
                            noOptionsMessage={() => t('table:no_role')}
                            loadingMessage={() => t('loading:role')}
                            isLoading={
                              watch('project_id') != null
                                ? roleIsLoading
                                : false
                            }
                            placeholder={t(
                              'cloud:role_manage.add_role.choose_role',
                            )}
                            defaultValue={roleOptions?.find(
                              item => item.value === getValues('role_id'),
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
            </form>
          </Form>
        </div>
        <div className="mt-4 flex justify-center space-x-2">
          <Button
            type="button"
            variant="secondary"
            className="inline-flex w-full justify-center rounded-md border focus:ring-1 focus:ring-secondary-700 focus:ring-offset-1 sm:mt-0 sm:w-auto sm:text-body-sm"
            onClick={resetForm}
            startIcon={
              <img src={btnCancelIcon} alt="Cancel" className="h-5 w-5" />
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
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
          />
        </div>
      </div>
    </Dialog>
  )
}
