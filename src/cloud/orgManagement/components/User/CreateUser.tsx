import { useEffect, useState } from 'react'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/Button'
import {
  Form,
  FormDrawer,
  InputField,
  SelectDropdown,
  type SelectOptionString,
  SelectField,
} from '~/components/Form'
import { type CreateUserDTO, useCreateUser } from '../../api/userAPI'
import {
  emailSchema,
  emptySelectSchema,
  nameSchema,
  passwordSchema,
} from '~/utils/schemaValidation'
import storage from '~/utils/storage'
import { queryClient } from '~/lib/react-query'
import { flattenData } from '~/utils/misc'
import i18n from '~/i18n'

import { type OrgList } from '~/layout/MainLayout/types'

import { PlusIcon } from '~/components/SVGIcons'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { useGetRoles } from '~/cloud/role/api'
import { useAreaList } from '~/layout/MainLayout/components/UserAccount/api/getAreaList'

export const userSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    phone: z.string(),
    password: passwordSchema,
    confirmPassword: passwordSchema.optional(),
    project_id: z.string().optional(),
    org_id: z.string().optional(),
    role_id: z.string().optional(),
    province: emptySelectSchema,
    district: emptySelectSchema,
    ward: emptySelectSchema,
    full_address: z.string().optional(),
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

  const { id: projectId } = storage.getProject()
  const { mutate, isLoading, isSuccess } = useCreateUser()
  const { data } = useGetRoles({ projectId })
  const roleOptions = data?.roles?.map(item => ({
    label: item.name,
    value: item.id,
  })) || [{ label: '', value: '' }]

  const [option, setOption] = useState<SelectOptionString>()
  const [role, setRole] = useState<SelectOptionString>()
  const [provinceCode, setProvinceCode] = useState('')
  const [districtCode, setDistrictCode] = useState('')
  const [wardCode, setWardCode] = useState('')

  //get province list
  const { data: provinceList } = useAreaList({
    config: {
      // suspense: false,
      select: (data: any) => {
        const transformArr = data.map((item: any) => {
          if (item.areaCode === provinceCode) {
            return { value: item.areaCode, label: item.name, selected: true }
          }
          return { value: item.areaCode, label: item.name }
        })
        transformArr.push({ value: '', label: 'Tỉnh/TP' })
        return transformArr
      },
    },
    param: {
      parentCode: '',
      type: 'PROVINCE',
      queryKey: 'province-list',
    },
  })

  // get district list
  const { data: districtList } = useAreaList({
    config: {
      suspense: false,
      select: (data: any) => {
        const transformArr = data.map((item: any) => {
          if (item.areaCode === districtCode) {
            return { value: item.areaCode, label: item.name, selected: true }
          }
          return { value: item.areaCode, label: item.name }
        })
        transformArr.push({ value: '', label: 'Huyện/Quận' })
        return transformArr
      },
      enabled: !!provinceCode,
    },
    param: {
      parentCode: provinceCode,
      type: 'DISTRICT',
      queryKey: 'district-list',
    },
  })

  // get ward list
  const { data: wardList } = useAreaList({
    config: {
      suspense: false,
      select: (data: any) => {
        const transformArr = data.map((item: any) => {
          if (item.areaCode === wardCode) {
            return { value: item.areaCode, label: item.name, selected: true }
          }
          return { value: item.areaCode, label: item.name }
        })
        transformArr.push({ value: '', label: 'Phường/Xã' })
        return transformArr
      },
      enabled: !!districtCode,
    },
    param: {
      parentCode: districtCode,
      type: 'WARD',
      queryKey: 'ward-list',
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
    >
      <Form<CreateUserDTO['data'], typeof userSchema>
        id="create-user"
        onSubmit={values => {
          mutate({
            data: {
              project_id: projectId,
              org_id: option?.value || '',
              name: values.name,
              email: values.email,
              password: values.password,
              role_id: role?.value || '',
              phone: values.phone,
              province: values.province,
              district: values.district,
              ward: values.ward,
              full_address: values.full_address,
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
                  t('cloud:org_manage.user_manage.add_user.phone') ?? 'Phone'
                }
                type="number"
                error={formState.errors['phone']}
                registration={register('phone')}
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
                type="password"
              />
              <InputField
                label={
                  t('cloud:org_manage.user_manage.add_user.confirm_password') ??
                  'Confirm password'
                }
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
                <SelectField
                  error={formState.errors['province']}
                  registration={register('province')}
                  options={provinceList || [{ value: '', label: 'Tỉnh/TP' }]}
                  classchild="w-full"
                  onChange={e => setProvinceCode(e.target.value)}
                />

                <SelectField
                  error={formState.errors['district']}
                  registration={register('district')}
                  options={districtList || [{ value: '', label: 'Huyện/Quận' }]}
                  onChange={e => setDistrictCode(e.target.value)}
                />

                <SelectField
                  error={formState.errors['ward']}
                  registration={register('ward')}
                  options={wardList || [{ value: '', label: 'Phường/Xã' }]}
                />
              </div>

              <InputField
                label={t('form:enter_address')}
                registration={register('full_address')}
              />
            </>
          )
        }}
      </Form>
    </FormDrawer>
  )
}
