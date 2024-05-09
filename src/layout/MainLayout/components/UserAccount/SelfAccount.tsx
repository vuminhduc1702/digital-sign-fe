import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import * as z from 'zod'
import { useSpinDelay } from 'spin-delay'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useUserInfo } from '@/cloud/orgManagement/api/userAPI'
import { Button } from '@/components/ui/button'
import { InputField, SelectField } from '@/components/Form'
import {
  emptyInputSchema,
  emptySelectSchema,
  phoneSchemaRegex,
} from '@/utils/schemaValidation'
import { useAreaList } from './api/getAreaList'
import {
  useMutationSelfAccountInfo,
  type UpdateSelfAccountInfoDTO,
} from './api/updateSelfAccountInfo'
import TitleBar from '@/components/Head/TitleBar'
import { Spinner } from '@/components/Spinner'

import narrowLeft from '@/assets/icons/narrow-left.svg'
import { ContentLayout } from '@/layout/ContentLayout'

export const selfInfoSchema = z.object({
  name: emptyInputSchema,
  phone: phoneSchemaRegex,
  email: z.string().optional(),
  profile: z.object({
    district: emptySelectSchema,
    full_address: z.string().optional(),
    province: emptySelectSchema,
    tax_code: emptyInputSchema,
    ward: emptySelectSchema,
  }),
})

const SelfAccount = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { mutate, isLoading } = useMutationSelfAccountInfo()

  //get user info
  const { data: userInfoData, isLoading: userInfoIsLoading } = useUserInfo({})

  const { register, formState, handleSubmit, watch, reset, setValue } = useForm<
    UpdateSelfAccountInfoDTO['data']
  >({
    resolver: selfInfoSchema && zodResolver(selfInfoSchema),
  })

  useEffect(() => {
    if (userInfoData != null) {
      reset({
        name: userInfoData?.name,
        phone: userInfoData?.phone,
        email: userInfoData?.email,
        profile: {
          tax_code: userInfoData?.profile?.tax_code,
          province: userInfoData?.profile?.province,
          district: userInfoData?.profile?.district,
          ward: userInfoData?.profile?.ward,
          full_address: userInfoData?.profile?.full_address,
        },
      })
    }
  }, [userInfoData])

  const { data: provinceList, isLoading: provinceListIsLoading } = useAreaList({
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

  const showSpinner = useSpinDelay(userInfoIsLoading || provinceListIsLoading, {
    delay: 150,
    minDuration: 300,
  })

  return (
    <ContentLayout title={t('user:user_info')}>
      <div className="flex h-full w-2/3 flex-col self-center py-8">
        <div className="flex items-center">
          <div
            className="mr-auto flex cursor-pointer rounded-md border border-secondary-700 px-3 py-2 text-base font-medium"
            onClick={() => navigate(-1)}
          >
            <img
              src={narrowLeft}
              alt="left"
              className="aspect-square w-[20px]"
            />
            <span className="ml-2">{t('form:back')}</span>
          </div>
          <div className="mr-auto text-h1">{t('form:title')}</div>
        </div>

        <TitleBar
          title={t('billing:subcription.popup.customer_info')}
          className="mb-4 mt-12 rounded-md bg-secondary-700 pl-3"
        />

        {userInfoIsLoading || provinceListIsLoading ? (
          <div className="flex grow items-center justify-center">
            <Spinner showSpinner={showSpinner} size="xl" />
          </div>
        ) : (
          <>
            <form
              id="update-self-account-info"
              onSubmit={handleSubmit(values =>
                mutate({
                  data: { ...values },
                  tenant_id: userInfoData?.user_id as string,
                }),
              )}
              className="w-full space-y-6 pr-32"
            >
              <div className="grid grid-cols-4 gap-4">
                <div className="col-start-1 flex items-center justify-end">
                  {t('form:enter_name')}{' '}
                  <span className="text-primary-400">*</span>
                </div>
                <div className="col-start-2">
                  <InputField
                    classchild="w-full"
                    classnamefieldwrapper="flex justify-end items-center"
                    error={formState.errors['name']}
                    registration={register('name')}
                  />
                </div>
                <div className="col-start-3 flex items-center justify-end">
                  {t('form:enter_tax')}{' '}
                  <span className="text-primary-400">*</span>
                </div>
                <div className="col-start-4">
                  <InputField
                    type="number"
                    classchild="w-full"
                    classnamefieldwrapper="flex items-center"
                    error={formState?.errors?.profile?.tax_code}
                    registration={register('profile.tax_code')}
                  />
                </div>
                <div className="col-start-1 flex items-center justify-end">
                  {t('form:enter_phone_num')}{' '}
                  <span className="text-primary-400">*</span>
                </div>
                <div className="col-start-2">
                  <InputField
                    type="number"
                    classchild="w-full"
                    classnamefieldwrapper="flex flex justify-end items-center"
                    error={formState.errors['phone']}
                    registration={register('phone')}
                  />
                </div>
                <div className="col-start-3 flex items-center justify-end">
                  {t('form:email')} <span className="text-primary-400">*</span>
                </div>
                <div className="col-start-4">
                  <InputField
                    registration={register('email')}
                    disabled
                    classchild="w-full"
                    classnamefieldwrapper="flex items-center"
                  />
                </div>
                <div className="col-start-1 flex items-center justify-end">
                  {t('cloud:org_manage.event_manage.add_event.action.address')}
                  <span className="text-primary-400">*</span>
                </div>
                <div className="col-start-2">
                  <SelectField
                    error={formState?.errors?.profile?.province}
                    registration={register('profile.province', {
                      onChange: () =>
                        setValue('profile.district', districtList?.[0]?.value),
                    })}
                    options={provinceList}
                    classchild="w-full"
                    placeholder={t(
                      'cloud:org_manage.user_manage.add_user.province',
                    )}
                  />
                </div>
                <div>
                  <SelectField
                    error={formState?.errors?.profile?.district}
                    registration={register('profile.district')}
                    options={districtList}
                    placeholder={t(
                      'cloud:org_manage.user_manage.add_user.district',
                    )}
                  />
                </div>
                <div>
                  <SelectField
                    error={formState?.errors?.profile?.ward}
                    registration={register('profile.ward')}
                    options={wardList}
                    placeholder={t(
                      'cloud:org_manage.user_manage.add_user.ward',
                    )}
                  />
                </div>
                <div className="col-start-1 flex items-center justify-end">
                  {t('form:enter_address')}
                </div>
                <div className="col-start-2 col-end-5">
                  <InputField
                    error={formState?.errors?.profile?.full_address}
                    registration={register('profile.full_address')}
                    classchild="w-full"
                    classnamefieldwrapper="flex items-center"
                  />
                </div>
              </div>
            </form>

            <div className="mt-4 flex justify-center">
              <Button
                variant="primary"
                size="lg"
                className="rounded-md"
                form="update-self-account-info"
                type="submit"
                isLoading={isLoading}
              >
                {t('btn:save')}
              </Button>
            </div>
          </>
        )}
      </div>
    </ContentLayout>
  )
}

export default SelfAccount
