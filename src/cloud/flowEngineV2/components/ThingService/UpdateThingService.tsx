import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { Button } from '~/components/Button'
import { Form, InputField } from '~/components/Form'
import { Drawer } from '~/components/Drawer'
import { type UpdateUserDTO, useUpdateUser } from '../../api/thingServiceAPI'
import { ComboBoxSelectOrg } from '~/layout/MainLayout/components'
import { useDefaultCombobox } from '~/utils/hooks'
import {
  emailSchema,
  nameSchema,
  passwordSchema,
} from '~/utils/schemaValidation'

import { type OrgMapType } from '~/layout/OrgManagementLayout/components/OrgManageSidebar'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnCancelIcon from '~/assets/icons/btn-cancel.svg'

type UpdateUserProps = {
  userId: string
  name: string
  email: string
  close: () => void
  isOpen: boolean
}

// FIXME: password can not validate passwordSchema if add .or(z.string().optional())
export const updatedUserSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema.or(z.string().optional()),
    confirmPassword: passwordSchema.or(z.string().optional()),
    project_id: z.string().optional(),
    org_id: z.string().optional(),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        path: ['confirmPassword'],
        code: 'custom',
        message: 'Mật khẩu nhập lại không đúng',
      })
    }
  })

export function UpdateThingService({
  userId,
  name,
  close,
  isOpen,
  email,
}: UpdateUserProps) {
  const { t } = useTranslation()

  const defaultComboboxOrgData = useDefaultCombobox('org')

  const { mutate, isLoading, isSuccess } = useUpdateUser()

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  const [filteredComboboxData, setFilteredComboboxData] = useState<
    OrgMapType[]
  >([])
  const selectedOrgId =
    filteredComboboxData.length !== 1 ? '' : filteredComboboxData[0]?.id

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      title={t('cloud:org_manage.user_manage.add_user.edit')}
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
            form="update-user"
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
      <Form<UpdateUserDTO['data'], typeof updatedUserSchema>
        id="update-user"
        onSubmit={values =>
          mutate({
            data: {
              name: values.name,
              email: values.email,
              password: values.password,
              org_id: selectedOrgId,
            },
            userId,
          })
        }
        schema={updatedUserSchema}
        options={{
          defaultValues: { name, email },
        }}
      >
        {({ register, formState }) => (
          <>
            <InputField
              label={
                t('cloud:org_manage.user_manage.add_user.name') ?? "User's name"
              }
              error={formState.errors['name']}
              registration={register('name')}
            />
            <InputField
              label={
                t('cloud:org_manage.user_manage.add_user.email') ??
                "User's email"
              }
              error={formState.errors['email']}
              registration={register('email')}
            />
            <InputField
              label={
                t('cloud:org_manage.user_manage.add_user.password') ??
                'Password'
              }
              error={formState.errors['password']}
              registration={register('password')}
            />
            <InputField
              label={
                t('cloud:org_manage.user_manage.add_user.confirm_password') ??
                'Confirm password'
              }
              error={formState.errors['confirmPassword']}
              registration={register('confirmPassword')}
            />
            <ComboBoxSelectOrg
              label={
                t('cloud:org_manage.user_manage.add_user.parent') ??
                'Parent organization'
              }
              setFilteredComboboxData={setFilteredComboboxData}
              hasDefaultComboboxData={defaultComboboxOrgData}
            />
          </>
        )}
      </Form>
    </Drawer>
  )
}
