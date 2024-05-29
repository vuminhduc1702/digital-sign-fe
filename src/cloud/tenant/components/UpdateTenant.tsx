import { HiOutlineXMark } from 'react-icons/hi2'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import { useUpdateCustomer, type UpdateCustomerDTO } from '../api/updateTenant'
import * as z from 'zod'
import {
  emailSchema,
  nameSchema,
  phoneSchemaRegex,
} from '@/utils/schemaValidation'
import { UpdateCustomerRole } from './UpdateTenantRole'
import { TenantRoleTable } from './TenantRoleTable'
import { useDisclosure } from '@/utils/hooks'

import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

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

  const dataDefault = {
    customerId,
    name,
    email,
    phone,
  }

  const form = useForm<UpdateCustomerDTO['data']>({
    resolver: updateCustomerSchema && zodResolver(updateCustomerSchema),
    defaultValues: dataDefault,
  })
  const { register, formState, handleSubmit, getValues } = form

  const { mutate, isLoading, isSuccess } = useUpdateCustomer()
  const {
    close: closeRole,
    open: openRole,
    isOpen: isOpenRole,
  } = useDisclosure()

  useEffect(() => {
    if (isSuccess && close) {
      close()
    }
  }, [isSuccess])

  useEffect(() => {
    form.reset(dataDefault)
  }, [isOpen])

  // const [rowSelection, setRowSelection] = useState({})
  // const pdfHeader = useMemo(
  //   () => [
  //     t('table:no'),
  //     t('cloud:tenant.table.project'),
  //     t('cloud:tenant.table.role'),
  //   ],
  //   [],
  // )
  // const rowSelectionKey = Object.keys(rowSelection)
  // const formatExcel = customerData?.tenant?.reduce(
  //   (acc, curr, index) => {
  //     if (rowSelectionKey.includes(curr.id)) {
  //       const temp = {
  //         [t('table:no')]: (index + 1 + offset).toString(),
  //         [t('cloud:tenant.table.project')]: curr.tenant,
  //         [t('cloud:tenant.table.role')]: curr.phone,
  //       }
  //     }
  //     return acc
  //   },
  //   [] as Array<{ [key: string]: string }>,
  // )

  return (
    <Dialog isOpen={isOpen} onClose={close} initialFocus={cancelButtonRef}>
      <div className="inline-block h-screen w-full transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-h1 text-secondary-900">
              {t('cloud:dashboard.table.edit_tenant')}
            </DialogTitle>
            <div className="ml-3 flex h-7 items-center">
              <button
                className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                onClick={close}
              >
                <span className="sr-only">Close panel</span>
                <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
          <Form {...form}>
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
                <FormLabel className="self-center text-right">Name</FormLabel>
                <FormControl>
                  <Input disabled value={getValues('name')} />
                </FormControl>
                <FormLabel
                  className={`col-start-4 self-center text-right ${formState.errors.email ? 'text-destructive' : ''}`}
                >
                  Email
                </FormLabel>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <div>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormLabel
                  className={`col-start-1 self-center text-right ${formState.errors.name ? 'text-destructive' : ''}`}
                >
                  {t('cloud:org_manage.org_manage.overview.name')}
                </FormLabel>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <div>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormLabel
                  className={`col-start-4 self-center text-right ${formState.errors.phone ? 'text-destructive' : ''}`}
                >
                  {t('cloud:org_manage.user_manage.add_user.phone')}
                </FormLabel>
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <div>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormLabel className={`col-start-1 self-center text-right`}>
                  {t('cloud:org_manage.user_manage.add_user.password')}
                </FormLabel>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div>
                        <FormControl>
                          <Input {...field} type="password" />
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
        <UpdateCustomerRole
          modalTitle={t('form:role.add')}
          customerId={customerId}
          isOpenRole={isOpenRole}
          closeRole={closeRole}
        />
        <div className="mt-4 px-14">
          <TenantRoleTable
            data={permissions}
            customerId={customerId}
            isHiddenCheckbox={true}
          />
        </div>
      </div>
    </Dialog>
  )
}
