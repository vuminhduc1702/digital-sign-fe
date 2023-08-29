import { useState } from 'react'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/Button'
import {
  Form,
  FormDrawer,
  InputField,
  SelectDropdown,
  type SelectOption,
} from '~/components/Form'
import { type CreateUserDTO, useCreateUser } from '../../api/userAPI'
import {
  emailSchema,
  nameSchema,
  passwordSchema,
} from '~/utils/schemaValidation'
import { useDefaultCombobox } from '~/utils/hooks'
import storage from '~/utils/storage'
import { queryClient } from '~/lib/react-query'
import { flattenData } from '~/utils/misc'

import { type OrgList } from '~/layout/MainLayout/types'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

export const userSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema.optional(),
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

export function CreateUser() {
  const { t } = useTranslation()

  const orgListCache: OrgList | undefined = queryClient.getQueryData(['orgs'], {
    exact: false,
  })
  const { acc: orgFlattenData } = flattenData(
    orgListCache?.organizations,
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )
  const defaultComboboxOrgData = useDefaultCombobox('org')
  const orgSelectOptions = [defaultComboboxOrgData, ...orgFlattenData]

  const { id: projectId } = storage.getProject()
  const { mutate, isLoading, isSuccess } = useCreateUser()

  const [option, setOption] = useState<SelectOption>({ label: '', value: '' })

  // TODO: Create Role SelectDropdown

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
      title={t('cloud:org_manage.user_manage.add_user.title')}
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
              org_id: values.org_id,
              name: values.name,
              email: values.email,
              password: values.password,
            },
          })
        }}
        schema={userSchema}
      >
        {({ register, formState, control, setValue }) => {
          return (
            <>
              <InputField
                label={
                  t('cloud:org_manage.user_manage.add_user.name') ?? 'Name'
                }
                error={formState.errors['name']}
                registration={register('name')}
              />
              <InputField
                label={
                  t('cloud:org_manage.user_manage.add_user.email') ?? 'Email'
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
              <div className="space-y-1">
                <SelectDropdown
                  label={t('cloud:org_manage.device_manage.add_device.parent')}
                  name="org_id"
                  control={control}
                  options={
                    orgSelectOptions?.map(org => ({
                      label: org?.name,
                      value: org?.id,
                    })) || [{ label: t('loading:org'), value: '' }]
                  }
                  onChange={e => {
                    setOption(e)
                    setValue('org_id', e.value)
                  }}
                  value={option}
                />
                <p className="text-body-sm text-primary-400">
                  {formState?.errors?.org_id?.message}
                </p>
              </div>
            </>
          )
        }}
      </Form>
    </FormDrawer>
  )
}
