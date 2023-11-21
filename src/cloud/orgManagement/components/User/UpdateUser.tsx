import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '~/components/Button'
import { Drawer } from '~/components/Drawer'
import { InputField, SelectDropdown, SelectField } from '~/components/Form'
import { useUpdateUser, type UpdateUserDTO } from '../../api/userAPI'
import i18n from '~/i18n'
import { flattenData } from '~/utils/misc'
import storage from '~/utils/storage'
import { useGetRoles } from '~/cloud/role/api'
import { useAreaList } from '~/layout/MainLayout/components/UserAccount/api/getAreaList'
import { useGetOrgs } from '~/layout/MainLayout/api'

import { userInfoSchema } from './CreateUser'

import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { EyeHide, EyeShow } from '~/components/SVGIcons'

type UpdateUserProps = {
  userId: string
  name: string
  email: string
  close: () => void
  isOpen: boolean
  org_id: string
  org_name: string
  role_id: string
  role_name: string
  phone: string
  profile: string
}

export const updatedUserSchema = userInfoSchema
  .omit({ password: true, confirmPassword: true })
  .and(
    z.object({
      password: z.string().optional(),
      confirmPassword: z.string().optional(),
    }),
  )
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        path: ['confirmPassword'],
        code: 'custom',
        message: i18n.t('auth:pass_invalid'),
      })
    }
  })

export function UpdateUser({
  userId,
  name,
  close,
  isOpen,
  email,
  org_id,
  role_id,
  phone,
  profile,
}: UpdateUserProps) {
  const { t } = useTranslation()

  const { mutate, isLoading, isSuccess } = useUpdateUser()

  const dataProfile = JSON.parse(profile)

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  const { register, formState, handleSubmit, control, getValues, watch } =
    useForm<UpdateUserDTO['data']>({
      resolver: updatedUserSchema && zodResolver(updatedUserSchema),
      defaultValues: {
        name,
        email,
        phone: phone !== 'undefined' ? phone : '',
        org_id,
        role_id,
        profile: dataProfile,
      },
    })

  const { id: projectId } = storage.getProject()
  const { data: orgData } = useGetOrgs({ projectId })
  const { acc: orgFlattenData } = flattenData(
    orgData?.organizations,
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )
  const orgSelectOptions = orgFlattenData?.map(org => ({
    label: org?.name,
    value: org?.id,
  }))

  const { data: roleData } = useGetRoles({ projectId })
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
      <form
        id="update-user"
        className="w-full space-y-6"
        onSubmit={handleSubmit(values =>
          mutate({
            data: {
              name: values.name,
              phone: values.phone,
              password: values.password,
              email: values.email,
              org_id: values.org_id,
              role_id: values.role_id,
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
            userId,
          }),
        )}
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
          <div className="space-y-1">
            <SelectDropdown
              isClearable={true}
              label={t('cloud:org_manage.device_manage.add_device.parent')}
              name="org_id"
              control={control}
              options={orgSelectOptions}
              defaultValue={orgSelectOptions.find(
                item => item.value === getValues('org_id'),
              )}
            />
            <p className="text-body-sm text-primary-400">
              {formState?.errors?.org_id?.message}
            </p>
          </div>
          <div className="space-y-1">
            <SelectDropdown
              isClearable={true}
              label={t('cloud:org_manage.user_manage.add_user.role')}
              name="role_id"
              control={control}
              options={roleOptions}
              defaultValue={roleOptions?.find(
                item => item.value === getValues('role_id'),
              )}
            />
            <p className="text-body-sm text-primary-400">
              {formState?.errors?.role_id?.message}
            </p>
          </div>
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
    </Drawer>
  )
}
