import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import * as z from 'zod'
import narrowLeft from '~/assets/icons/narrow-left.svg'
import { useUserInfo } from '~/cloud/orgManagement/api/userAPI'
import { Button } from '~/components/Button'
import { Form, InputField, SelectField } from '~/components/Form'
import {
  emptyInputSchema,
  emptySelectSchema,
  phoneSchemaRegex,
} from '~/utils/schemaValidation'
import { useAreaList } from './api/getAreaList'
import {
  useMutationSelfAccountInfo,
  type UpdateSelfAccountInfoDTO,
} from './api/updateSelfAccountInfo'
import TitleBar from '~/components/Head/TitleBar'

export const selfInfoSchema = z.object({
  name: emptyInputSchema,
  tax_code: emptyInputSchema,
  phone: phoneSchemaRegex,
  email: z.string().optional(),
  province: emptySelectSchema,
  district: emptySelectSchema,
  ward: emptySelectSchema,
  address: z.string().optional(),
})

const SelfAccount = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [provinceCode, setProvinceCode] = useState('')
  const [districtCode, setDistrictCode] = useState('')
  const [wardCode, setWardCode] = useState('')

  const { mutate, isLoading, isSuccess } = useMutationSelfAccountInfo()

  //get user info
  const { data: userInfoData } = useUserInfo({
    config: {
      suspense: false,
    },
  })

  useEffect(() => {
    if (userInfoData) {
      setProvinceCode(userInfoData?.profile?.province)
      setDistrictCode(userInfoData?.profile?.district)
      setWardCode(userInfoData?.profile?.ward)
    }
  }, [])

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
    <div className="relative h-full px-10 py-8">
      <div className="relative text-center">
        <div
          className="absolute left-0 top-0 flex cursor-pointer rounded-md px-3 py-2 text-base font-medium"
          style={{ border: '1px solid #C9C9C9' }}
          onClick={() => navigate(-1)}
        >
          <img src={narrowLeft} alt="left" className="aspect-square w-[20px]" />
          <span className="ml-2">Trở lại</span>
        </div>
        <div className="text-base font-bold">Cập nhật thông tin tài khoản</div>
      </div>

      <TitleBar
        title={t('billing:subcription.popup.customer_info')}
        className="mb-4 mt-12 w-full rounded-md bg-gray-500 pl-3"
      />

      <Form<UpdateSelfAccountInfoDTO['data'], typeof selfInfoSchema>
        id="update-self-account-info"
        onSubmit={values =>
          mutate({
            data: {
              name: values.name,
              phone: values.phone,
              profile: {
                tax_code: values.tax_code,
                province: values.province,
                district: values.district,
                ward: values.ward,
                address: values.address,
              },
            },
            tenant_id: userInfoData?.user_id,
          })
        }
        schema={selfInfoSchema}
        options={{
          defaultValues: {
            name: userInfoData?.name,
            tax_code: userInfoData?.profile?.tax_code,
            phone: userInfoData?.phone,
            email: userInfoData?.email,
            province: userInfoData?.profile?.province,
            district: userInfoData?.profile?.district,
            ward: userInfoData?.profile?.ward,
            address: userInfoData?.profile?.full_address,
          },
        }}
      >
        {({ register, formState, control, setValue }) => (
          <div className="grid grid-cols-5 gap-4">
            <div className="col-start-1 flex items-center justify-end">
              {t('form:enter_name')} <span className="text-red-600">*</span>
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
              {t('form:enter_tax')} <span className="text-red-600">*</span>
            </div>
            <div className="col-start-4">
              <InputField
                type='number'
                classchild="w-full"
                classnamefieldwrapper="flex items-center"
                error={formState.errors['tax_code']}
                registration={register('tax_code')}
              />
            </div>
            <div className="col-start-1 flex items-center justify-end">
              {t('form:enter_phone_num')}{' '}
              <span className="text-red-600">*</span>
            </div>
            <div className="col-start-2">
              <InputField
                type='number'
                classchild="w-full"
                classnamefieldwrapper="flex flex justify-end items-center"
                error={formState.errors['phone']}
                registration={register('phone')}
              />
            </div>
            <div className="col-start-3 flex items-center justify-end">
              Email <span className="text-red-600">*</span>
            </div>
            <div className="col-start-4">
              <InputField
                disabled
                classchild="w-full"
                classnamefieldwrapper="flex items-center"
                registration={register('email')}
              />
            </div>
            <div className="col-start-1 flex items-center justify-end">
              {t('cloud:org_manage.event_manage.add_event.action.address')}
              <span className="text-red-600">*</span>
            </div>
            <div className="col-start-2">
              <SelectField
                error={formState.errors['province']}
                registration={register('province')}
                options={provinceList || [{ value: '', label: 'Tỉnh/TP' }]}
                classchild="w-full"
                onChange={e => setProvinceCode(e.target.value)}
              />
            </div>
            <div>
              <SelectField
                error={formState.errors['district']}
                registration={register('district')}
                options={districtList || [{ value: '', label: 'Huyện/Quận' }]}
                onChange={e => setDistrictCode(e.target.value)}
              />
            </div>
            <div>
              <SelectField
                error={formState.errors['ward']}
                registration={register('ward')}
                options={wardList || [{ value: '', label: 'Phường/Xã' }]}
              />
            </div>
            <div className="col-start-1 flex items-center justify-end">
              {t('form:enter_address')}
            </div>
            <div className="col-start-2 col-end-5">
              <InputField
                classchild="w-full"
                classnamefieldwrapper="flex items-center"
              />
            </div>
          </div>
        )}
      </Form>

      <div
        className="absolute bottom-8 flex justify-center"
        style={{ left: '43%' }}
      >
        <Button
          className="mr-5 cursor-pointer rounded-r-lg rounded-t-lg border-0 bg-neutral-500 px-7 py-2"
          form="update-self-account-info"
          type="submit"
        >
          Lưu
        </Button>
      </div>
    </div>
  )
}

export default SelfAccount
