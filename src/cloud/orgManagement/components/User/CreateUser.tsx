import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

import { Button } from '~/components/Button'
import { Form, FormDrawer, InputField } from '~/components/Form'

import { useProjectIdStore } from '~/stores/project'
import { ComboBoxSelectOrg } from '~/layout/MainLayout/components'
import { type CreateUserDTO, useCreateUser } from '../../api/userAPI'
import {
  emailSchema,
  nameSchema,
  passwordSchema,
} from '~/utils/schemaValidation'

import { type OrgMapType } from '~/layout/OrgManagementLayout/components/OrgManageSidebar'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

export const userSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
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

export function CreateUser() {
  const { t } = useTranslation()

  const [filteredComboboxData, setFilteredComboboxData] = useState<
    OrgMapType[]
  >([])
  const selectedOrgId =
    filteredComboboxData.length !== 1 ? '' : filteredComboboxData[0]?.id

  const projectId = useProjectIdStore(state => state.projectId)
  const { mutate, isLoading, isSuccess } = useCreateUser()

  return (
    <FormDrawer
      isDone={isSuccess}
      triggerButton={
        <Button
          className="rounded-md"
          variant="trans"
          size="square"
          startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
      }
      title={t('cloud.org_manage.user_manage.add_user.title')}
      submitButton={
        <Button
          className="rounded border-none"
          form="create-user"
          type="submit"
          size="lg"
          isLoading={isLoading}
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    >
      <Form<CreateUserDTO['data'], typeof userSchema>
        id="create-user"
        onSubmit={values => {
          mutate({
            data: {
              project_id: projectId,
              org_id: selectedOrgId,
              name: values.name,
              email: values.email,
              password: values.password,
            },
          })
        }}
        schema={userSchema}
      >
        {({ register, formState }) => (
          <>
            <InputField
              label={t('cloud.org_manage.user_manage.add_user.name') ?? 'Name'}
              error={formState.errors['name']}
              registration={register('name')}
            />
            <InputField
              label={
                t('cloud.org_manage.user_manage.add_user.email') ?? 'Email'
              }
              error={formState.errors['email']}
              registration={register('email')}
            />
            <InputField
              label={
                t('cloud.org_manage.user_manage.add_user.password') ??
                'Password'
              }
              error={formState.errors['password']}
              registration={register('password')}
            />
            <InputField
              label={
                t('cloud.org_manage.user_manage.add_user.confirm_password') ??
                'Confirm password'
              }
              error={formState.errors['confirmPassword']}
              registration={register('confirmPassword')}
            />
            <ComboBoxSelectOrg
              label={
                t('cloud.org_manage.user_manage.add_user.parent') ??
                'Parent organization'
              }
              setFilteredComboboxData={setFilteredComboboxData}
            />
            {/* <ComboBoxSelectRole
              label={
                t('cloud.org_manage.user_manage.add_user.role') ??
                'Role selection'
              }
              setFilteredComboboxData={setFilteredComboboxData}
            /> */}
          </>
        )}
      </Form>
    </FormDrawer>
  )
}
