import { XMarkIcon } from '@heroicons/react/24/outline'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '~/components/Button'
import { Dialog, DialogTitle } from '~/components/Dialog'
import { InputField } from '~/components/Form'
import {
  useUpdateCustomer,
  type UpdateCustomerDTO,
} from '../api/updateCustomer'
import * as z from 'zod'
import {
  emailSchema,
  nameSchema,
  phoneSchemaRegex,
} from '~/utils/schemaValidation'
import { UpdateCustomerRole } from './UpdateCustomerRole'
import { CustomerRoleTable } from './CustomerRoleTable'
import { useDisclosure } from '~/utils/hooks'

import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

export const updateCustomerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchemaRegex,
  password: z.string().optional(),
})

type UpdateCustomerProps = {
  customerId: string
  name: string
  email: string
  phone: string
  close: () => void
  isOpen: boolean
  permissions: Array<{}>
}

export function UpdateCustomer({
  customerId,
  name,
  email,
  phone,
  close,
  isOpen,
  permissions,
}: UpdateCustomerProps) {
  const { t } = useTranslation()
  const cancelButtonRef = useRef(null)

  const { register, formState, handleSubmit } = useForm<
    UpdateCustomerDTO['data']
  >({
    resolver: updateCustomerSchema && zodResolver(updateCustomerSchema),
    defaultValues: {
      customerId,
      name,
      email,
      phone,
    },
  })

  const { mutate, isLoading, isSuccess } = useUpdateCustomer()
  const {
    close: closeRole,
    open: openRole,
    isOpen: isOpenRole,
  } = useDisclosure()

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  console.log(permissions, 'permissions in update customer')

  return (
    <Dialog isOpen={isOpen} onClose={() => null} initialFocus={cancelButtonRef}>
      <div className="inline-block h-screen w-full transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <div className="flex items-center justify-between">
            <DialogTitle as="h3" className="text-h1 text-secondary-900">
              {t('form:customer.edit')}
            </DialogTitle>
            <div className="ml-3 flex h-7 items-center">
              <button
                className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                onClick={close}
              >
                <span className="sr-only">Close panel</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
          <form
            id="update-customer"
            className="mt-6 flex flex-col justify-between"
            onSubmit={handleSubmit(values => {
              mutate({
                data: {
                  name: values.name,
                  email: values.email,
                  phone: values.phone,
                  password: values.password,
                },
                customerId,
              })
            })}
          >
            <div className="grid grid-cols-6 gap-4">
              <div className="self-center text-right">ID</div>
              <InputField registration={register('customerId')} disabled />
              <div className="col-start-4 self-center text-right">Email</div>
              <InputField
                error={formState.errors['email']}
                registration={register('email')}
              />
              <div className="col-start-1 self-center text-right">
                {t('cloud:org_manage.org_manage.overview.name')}
              </div>
              <InputField
                error={formState.errors['name']}
                registration={register('name')}
              />
              <div className="col-start-4 self-center text-right">
                {t('cloud:org_manage.user_manage.add_user.phone')}
              </div>
              <InputField
                error={formState.errors['phone']}
                registration={register('phone')}
              />
              <div className="col-start-1 self-center text-right">
                {t('cloud:org_manage.user_manage.add_user.password')}
              </div>
              <InputField
                error={formState.errors['password']}
                registration={register('password')}
                type="password"
              />
            </div>
          </form>
        </div>
        <div className="mt-4 flex justify-center space-x-2">
          <Button
            type="button"
            variant="muted"
            className="inline-flex w-full justify-center rounded-md border text-red-600 focus:ring-1 focus:ring-secondary-700 focus:ring-offset-1 sm:mt-0 sm:w-auto sm:text-body-sm"
            onClick={openRole}
          >
            {t('form:role.add')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="inline-flex w-full justify-center rounded-md border focus:ring-1 focus:ring-secondary-700 focus:ring-offset-1 sm:mt-0 sm:w-auto sm:text-body-sm"
            onClick={close}
            startIcon={
              <img src={btnCancelIcon} alt="Cancel" className="h-5 w-5" />
            }
            ref={cancelButtonRef}
          />
          <Button
            isLoading={isLoading}
            form="update-customer"
            type="submit"
            size="md"
            className="bg-primary-400"
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
          />
        </div>
        {isOpenRole ? (
          <UpdateCustomerRole
            modalTitle={t('form:role.add')}
            customerId={customerId}
            project_id={''}
            roleIdProps={''}
            isOpenRole={true}
            closeRole={closeRole}
          />
        ) : null}
        <div className="mt-4 px-14">
          <CustomerRoleTable
            data={permissions}
            otherData={{ customerId: customerId }}
          />
        </div>
      </div>
    </Dialog>
  )
}