import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'

import { Button } from '~/components/Button'
import {
  FormDrawer,
  InputField,
  SelectDropdown,
  SelectField,
} from '~/components/Form'
import { type CreateUserDTO, useCreateUser } from '../../api/userAPI'
import {
  emailSchema,
  nameSchema,
  passwordSchema,
  phoneSchemaRegex,
} from '~/utils/schemaValidation'
import storage from '~/utils/storage'
import i18n from '~/i18n'
import { useGetRoles } from '~/cloud/role/api'
import { useAreaList } from '~/layout/MainLayout/components/UserAccount/api/getAreaList'
import { useGetOrgs } from '~/layout/MainLayout/api'

import { EyeHide, EyeShow, PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { ComplexTree } from '~/components/ComplexTree'

export const userInfoSchema = z.object({
  name: nameSchema,
  phone: phoneSchemaRegex,
  password: passwordSchema,
  confirmPassword: passwordSchema.optional(),
  email: emailSchema,
  org_id: z.string().optional(),
  role_id: z.string().optional(),
  project_id: z.string().optional(),
  profile: z
    .object({
      province: z.string(),
      district: z.string(),
      ward: z.string(),
      full_address: z.string(),
    })
    .optional(),
})
export const userSchema = userInfoSchema.superRefine(
  ({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        path: ['confirmPassword'],
        code: 'custom',
        message: i18n.t('auth:pass_invalid'),
      })
    }
  },
)

export function CreateUser() {
  const { t } = useTranslation()

  const { register, formState, handleSubmit, control, watch, reset } = useForm<
    CreateUserDTO['data']
  >({
    resolver: userSchema && zodResolver(userSchema),
  })
  // console.log('formState.errors', formState.errors)
  const no_org_val = t('cloud:org_manage.org_manage.add_org.no_org')

  const { mutate, isLoading, isSuccess } = useCreateUser()

  const projectId = storage.getProject()?.id

  const { data: orgData } = useGetOrgs({ projectId })

  const { data: roleData, isLoading: roleIsLoading } = useGetRoles({
    projectId,
  })
  const roleOptions = roleData?.roles?.map(item => ({
    label: item.name,
    value: item.id,
  }))

  const { data: provinceList } = useAreaList({
    parentCode: '',
    type: 'PROVINCE',
  })
  const { data: districtList } = useAreaList({
    parentCode: watch('profile.province'),
    type: 'DISTRICT',
    config: {
      enabled: !!watch('profile.province'),
    },
  })
  const { data: wardList } = useAreaList({
    parentCode: watch('profile.district'),
    type: 'WARD',
    config: {
      enabled: !!watch('profile.district'),
    },
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showRePassword, setShowRePassword] = useState(false)
  const toggleRePasswordVisibility = () => {
    setShowRePassword(prev => !prev)
  }
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

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
            <img src={btnSubmitIcon} alt="Submit" className="size-5" />
          }
        />
      }
      resetData={() => reset()}
    >
      <form
        id="create-user"
        className="w-full space-y-6"
        onSubmit={handleSubmit(values => {
          mutate({
            data: {
              project_id: projectId,
              org_id: values.org_id !== no_org_val ? values.org_id : '',
              name: values.name,
              email: values.email,
              password: values.password,
              role_id: values.role_id,
              phone: values.phone,
              profile:
                values.profile != null
                  ? {
                      province: values.profile.province,
                      district: values.profile.district,
                      ward: values.profile.ward,
                      full_address: values.profile.full_address,
                    }
                  : undefined,
            },
          })
        })}
      >
        <>
          <InputField
            label={t('cloud:org_manage.user_manage.add_user.name')}
            error={formState.errors['name']}
            registration={register('name')}
          />
          <InputField
            label={t('cloud:org_manage.user_manage.add_user.phone')}
            type="number"
            error={formState.errors['phone']}
            registration={register('phone')}
          />
          <InputField
            label={t('cloud:org_manage.user_manage.add_user.email')}
            error={formState.errors['email']}
            registration={register('email')}
          />
          <InputField
            label={t('cloud:org_manage.user_manage.add_user.password')}
            error={formState.errors['password']}
            registration={register('password')}
            type={showPassword ? 'text' : 'password'}
            endIcon={
              showPassword ? (
                <EyeShow
                  height={30}
                  width={30}
                  viewBox="0 0 30 30"
                  className="absolute bottom-0 right-2 z-20"
                  onClick={togglePasswordVisibility}
                />
              ) : (
                <EyeHide
                  height={30}
                  width={30}
                  viewBox="0 0 30 30"
                  className="absolute bottom-0 right-2 z-20"
                  onClick={togglePasswordVisibility}
                />
              )
            }
          />
          <InputField
            label={t('cloud:org_manage.user_manage.add_user.confirm_password')}
            error={formState.errors['confirmPassword']}
            registration={register('confirmPassword')}
            type={showRePassword ? 'text' : 'password'}
            endIcon={
              showRePassword ? (
                <EyeShow
                  height={30}
                  width={30}
                  viewBox="0 0 30 30"
                  className="absolute bottom-0 right-2 z-20"
                  onClick={toggleRePasswordVisibility}
                />
              ) : (
                <EyeHide
                  height={30}
                  width={30}
                  viewBox="0 0 30 30"
                  className="absolute bottom-0 right-2 z-20"
                  onClick={toggleRePasswordVisibility}
                />
              )
            }
          />
          <ComplexTree
            name="org_id"
            label={t('cloud:org_manage.device_manage.add_device.parent')}
            error={formState?.errors?.org_id}
            control={control}
            options={orgData?.organizations}
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
            isLoading={roleIsLoading}
            placeholder={t('cloud:role_manage.add_role.choose_role')}
            error={formState?.errors?.role_id}
          />

          <div className="grid grid-cols-3 gap-x-2">
            <div className="col-start-1 col-end-4">
              {t('cloud:org_manage.user_manage.add_user.address')}
            </div>
            <SelectField
              error={formState?.errors?.profile?.province}
              registration={register('profile.province')}
              options={provinceList}
              classchild="w-full"
              placeholder={t('cloud:org_manage.user_manage.add_user.province')}
            />
            <SelectField
              error={formState?.errors?.profile?.district}
              registration={register('profile.district')}
              options={districtList}
              placeholder={t('cloud:org_manage.user_manage.add_user.district')}
            />
            <SelectField
              error={formState?.errors?.profile?.ward}
              registration={register('profile.ward')}
              options={wardList}
              placeholder={t('cloud:org_manage.user_manage.add_user.ward')}
            />
          </div>
          <InputField
            label={t('form:enter_address')}
            registration={register('profile.full_address')}
          />
        </>
      </form>
    </FormDrawer>
  )
}
