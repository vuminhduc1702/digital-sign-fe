import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

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
import { flattenData } from '~/utils/misc'
import i18n from '~/i18n'
import { useGetRoles } from '~/cloud/role/api'
import { useAreaList } from '~/layout/MainLayout/components/UserAccount/api/getAreaList'
import { useGetOrgs } from '~/layout/MainLayout/api'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

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

  const {
    register,
    formState,
    handleSubmit,
    control,
    getValues,
    watch,
    reset,
  } = useForm<CreateUserDTO['data']>({
    resolver: userSchema && zodResolver(userSchema),
  })
  console.log('formState.errors', formState.errors)

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

  const { mutate, isLoading, isSuccess } = useCreateUser()
  const { data } = useGetRoles({ projectId })
  const roleOptions = data?.roles?.map(item => ({
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
      resetData={() => reset()}
    >
      <form
        id="create-user"
        className="w-full space-y-6"
        onSubmit={handleSubmit(values => {
          mutate({
            data: {
              project_id: projectId,
              org_id: values.org_id,
              name: values.name,
              email: values.email,
              password: values.password,
              role_id: values.role_id,
              phone: values.phone,
              province: values.province,
              district: values.district,
              ward: values.ward,
              full_address: values.full_address,
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
            type="password"
          />
          <InputField
            label={t('cloud:org_manage.user_manage.add_user.confirm_password')}
            error={formState.errors['confirmPassword']}
            registration={register('confirmPassword')}
            type="password"
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
              error={formState.errors['province']}
              registration={register('province')}
              options={provinceList}
              classchild="w-full"
              placeholder={t('cloud:org_manage.user_manage.add_user.province')}
            />

            <SelectField
              error={formState.errors['district']}
              registration={register('district')}
              options={districtList}
              placeholder={t('cloud:org_manage.user_manage.add_user.district')}
            />

            <SelectField
              error={formState.errors['ward']}
              registration={register('ward')}
              options={wardList}
              placeholder={t('cloud:org_manage.user_manage.add_user.ward')}
            />
          </div>

          <InputField
            label={t('form:enter_address')}
            registration={register('full_address')}
          />
        </>
      </form>
    </FormDrawer>
  )
}
