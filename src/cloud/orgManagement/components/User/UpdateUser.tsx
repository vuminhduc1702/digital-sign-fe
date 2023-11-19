import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '~/components/Button'
import { Drawer } from '~/components/Drawer'
import {
  InputField,
  SelectDropdown,
  SelectField,
  type SelectOptionString,
} from '~/components/Form'
import { useUpdateUser, type UpdateUserDTO, Profile } from '../../api/userAPI'
import i18n from '~/i18n'
import { queryClient } from '~/lib/react-query'
import { flattenData } from '~/utils/misc'
import storage from '~/utils/storage'
import { useGetRoles } from '~/cloud/role/api'
import { useAreaList } from '~/layout/MainLayout/components/UserAccount/api/getAreaList'

import {
  emailSchema,
  nameSchema,
  passwordSchema,
} from '~/utils/schemaValidation'
import { type OrgList } from '~/layout/MainLayout/types'

import btnCancelIcon from '~/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

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

export const updatedUserSchema = z
  .object({
    name: nameSchema,
    phone: z.string(),
    password: passwordSchema.or(z.string().optional()),
    confirmPassword: passwordSchema.or(z.string().optional()),
    email: emailSchema,
    org_id: z.string().optional(),
    role_id: z.string().optional(),
    project_id: z.string().optional(),
    profile: z.object({
      province: z.string().optional(),
      district: z.string().optional(),
      ward: z.string().optional(),
      full_address: z.string().optional(),
    }),
  })
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
  org_name,
  role_id,
  role_name,
  phone,
  profile,
}: UpdateUserProps) {
  const { t } = useTranslation()

  const { mutate, isLoading, isSuccess } = useUpdateUser()
  const [provinceCode, setProvinceCode] = useState('')
  const [districtCode, setDistrictCode] = useState('')
  const dataProfile = JSON.parse(profile)

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  const orgListCache: OrgList | undefined = queryClient.getQueryData(['orgs'], {
    exact: false,
  })
  const { acc: orgFlattenData } = flattenData(
    orgListCache?.organizations,
    ['id', 'name', 'level', 'description', 'parent_name'],
    'sub_orgs',
  )

  const { id: projectId } = storage.getProject()

  const { data } = useGetRoles({ projectId })
  const roleOptions = data?.roles?.map(item => ({
    label: item.name,
    value: item.id,
  })) || [{ label: '', value: '' }]

  const [option, setOption] = useState<SelectOptionString>({
    label: org_name !== 'undefined' ? org_name : '',
    value: org_id !== 'undefined' ? org_id : '',
  })
  const [role, setRole] = useState<SelectOptionString>({
    label: role_name !== 'undefined' ? role_name : '',
    value: role_id !== 'undefined' ? role_id : '',
  })

  const { data: provinceList } = useAreaList({
    parentCode: '',
    type: 'PROVINCE',
  })

  const { data: districtList } = useAreaList({
    parentCode: provinceCode,
    type: 'DISTRICT',
    config: {
      enabled: !!provinceCode,
    },
  })

  const { data: wardList } = useAreaList({
    parentCode: districtCode,
    type: 'WARD',
    config: {
      enabled: !!districtCode,
    },
  })

  const { register, formState, control, setValue, handleSubmit } = useForm<
    UpdateUserDTO['data']
  >({
    resolver: updatedUserSchema && zodResolver(updatedUserSchema),
    defaultValues: {
      name,
      email,
      phone: phone !== 'undefined' ? phone : '',
      profile: dataProfile,
    },
  })
  useEffect(() => {
    setProvinceCode(dataProfile.province)
    setDistrictCode(dataProfile.district)
  }, [dataProfile])

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
              org_id: option?.value || '',
              role_id: role?.value || '',
              profile: {
                province: values.profile.province,
                district: values.profile.district,
                ward: values.profile.ward,
                full_address: values.profile.full_address,
              },
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
          />
          <InputField
            label={t('cloud:org_manage.user_manage.add_user.confirm_password')}
            error={formState.errors['confirmPassword']}
            registration={register('confirmPassword')}
          />
          <div className="space-y-1">
            <SelectDropdown
              isClearable={true}
              label={t('cloud:org_manage.device_manage.add_device.parent')}
              name="org_id"
              control={control}
              options={
                orgFlattenData?.map(org => ({
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
          <div className="space-y-1">
            <SelectDropdown
              isClearable={true}
              label={t('cloud:org_manage.user_manage.add_user.role')}
              name="role_id"
              control={control}
              options={roleOptions}
              onChange={e => {
                setRole(e)
                setValue('role_id', e.value)
              }}
              value={role}
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
              options={provinceList || [{ value: '', label: '' }]}
              classchild="w-full"
              onChange={e => setProvinceCode(e.target.value)}
              placeholder={t('cloud:org_manage.user_manage.add_user.province')}
            />

            <SelectField
              error={formState?.errors?.profile?.district}
              registration={register('profile.district')}
              options={districtList || [{ value: '', label: '' }]}
              onChange={e => setDistrictCode(e.target.value)}
              placeholder={t('cloud:org_manage.user_manage.add_user.district')}
            />

            <SelectField
              error={formState?.errors?.profile?.ward}
              registration={register('profile.ward')}
              options={wardList || [{ value: '', label: '' }]}
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
