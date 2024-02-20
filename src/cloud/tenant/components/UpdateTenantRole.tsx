import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { useProjects } from '~/cloud/project/api'
import { useGetRoles } from '~/cloud/role/api'
import { Button } from '~/components/Button'
import { Dialog, DialogTitle } from '~/components/Dialog'
import { InputField, SelectField } from '~/components/Form'
import {
  useUpdateCustomerRole,
  type UpdateEntityCustomerRoleDTO,
} from '../api/updateTenantRole'

import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { XMarkIcon } from '@heroicons/react/24/outline'

type UpdateCustomerRoleProps = {
  customerId: string
  modalTitle: string
  project_id: string
  roleIdProps: string
  isOpenRole: boolean
  closeRole: () => void
}

export const updateEntityCustomerSchema = z.object({
  tenant_id: z.string().optional(),
  project_id: z.string().optional(),
  role_id: z.string().optional(),
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
  const [projectId, setProjectId] = useState(project_id)
  const [roleId, setRoleId] = useState()
  const cancelButtonRef = useRef(null)

  const { register, formState, handleSubmit } = useForm<
    UpdateEntityCustomerRoleDTO['data']
  >({
    resolver:
      updateEntityCustomerSchema && zodResolver(updateEntityCustomerSchema),
    defaultValues: {
      customer_id: customerId,
      project_list: project_id,
      role_list: roleIdProps,
    },
  })

  const { data: projectList } = useProjects({
    config: {
      suspense: false,
      select: (data: any) => {
        const transformArr = data?.projects.map((item: any) => {
          return {
            value: item.id,
            label: item.name,
          }
        })
        transformArr.push({ value: '', label: t('form:choose_project') })
        return transformArr
      },
    },
  })

  const { data: roleList } = useGetRoles({
    projectId: projectId,
    config: {
      suspense: false,
      enabled: !!projectId,
      select: (data: any) => {
        if (data?.roles.length > 0) {
          const transformArr = data?.roles.map((item: any) => {
            return {
              value: item.id,
              label: item.name,
            }
          })
          transformArr.push({ value: '', label: t('form:role.choose') })
          return transformArr
        }
        return [{ value: '', label: t('form:role.choose') }]
      },
    },
  })

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
      <div className="inline-block h-auto w-auto transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5">
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
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
          <form
            id="customer-role-form"
            className="mt-6 flex flex-col justify-between"
            onSubmit={handleSubmit(values => {
              mutate({
                data: {
                  project_permission: [
                    {
                      tenant_id: customerId,
                      project_id: projectId,
                      role_id: roleId,
                    },
                  ],
                },
              })
            })}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>User ID</div>
              <InputField disabled registration={register('customer_id')} />

              <div>Project</div>
              <div>
                <SelectField
                  error={formState.errors['project_list']}
                  registration={register('project_list')}
                  options={projectList}
                  onChange={e => {
                    setProjectId(e.target.value)
                  }}
                />
              </div>

              <div>Role</div>
              <div>
                <SelectField
                  error={formState.errors['role_list']}
                  registration={register('role_list')}
                  options={
                    roleList || [{ value: '', label: t('form:role.choose') }]
                  }
                  onChange={e => {
                    setRoleId(e.target.value)
                  }}
                />
              </div>
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
