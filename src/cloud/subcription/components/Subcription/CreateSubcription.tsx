import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { useGetPlans } from '~/cloud/billingPackage/api'
import { usePlanById } from '~/cloud/billingPackage/api/getPackageById'
import { useGetUsers } from '~/cloud/orgManagement/api/userAPI'
import { Button } from '~/components/Button'
import {
  Form,
  InputField,
  SelectDropdown,
  type SelectOptionString,
} from '~/components/Form'
import { FormDialog } from '~/components/FormDialog'
import { PlusIcon } from '~/components/SVGIcons'
import i18n from '~/i18n'
import storage from '~/utils/storage'
import {
  useCreateSubcription,
  type CreateSubcriptionDTO,
} from '../../api/subcriptionAPI/createSubcription'

export const entitySubcriptionSchema = z.object({
  plan_id: z
    .string()
    .nonempty({ message: i18n.t('billing:subcription.popup.choose_plan') }),
  user_id: z
    .string()
    .nonempty({ message: i18n.t('billing:subcription.popup.choose_user') }),
  register: z.string().optional(),
})

export function CreateSubcription() {
  const { t } = useTranslation()

  const { id: projectId } = storage.getProject()
  const [userValue, setUserValue] = useState<SelectOptionString | null>()
  const [userId, setUserId] = useState('')
  const [planValue, setPlanValue] = useState<SelectOptionString | null>()
  const [customerName, setCustomerName] = useState('')
  const [customerCode, setCustomerCode] = useState('')
  const [registerValue, setRegisterValue] = useState('')

  const { data: UserData } = useGetUsers({ projectId, expand: true })

  const { data: PlanData } = useGetPlans({ projectId })

  const { data: PlanDataById } = usePlanById({
    planId: planValue?.value || '',
    config: { enabled: !!planValue?.value, suspense: false },
  })

  const { mutate, isLoading, isSuccess } = useCreateSubcription()
  const resetData = () => {
    setUserValue(null)
    setPlanValue(null)
    setCustomerCode('')
    setCustomerName('')
    setRegisterValue('')
    setUserId('')
  }

  const parseNumber = (value: any) => {
    return value ? parseInt(value) : 0
  }

  const handleOnChange = (expected_number?: string) => {
    let result: any
    if (PlanDataById?.data?.payment_type === 'PREPAY') {
      if (PlanDataById?.data?.estimate === 'fix') {
        result =
          parseNumber(PlanDataById?.data?.price) +
          parseNumber(PlanDataById?.data?.fix_cost)
      } else if (PlanDataById?.data?.estimate === 'unit') {
        result =
          (parseNumber(expected_number) -
            parseNumber(PlanDataById?.data?.quantity_free)) *
            parseNumber(PlanDataById?.data?.price) +
          parseNumber(PlanDataById?.data?.fix_cost)
      }
    } else if (PlanDataById?.data?.payment_type === 'PREPAY') {
      result = parseNumber(PlanDataById?.data?.fix_cost)
    }
    setRegisterValue(result.toString() || '')
  }

  const valuePriceMethod = () => {
    let result = ''
    if (PlanDataById?.data?.estimate) {
      switch (PlanDataById?.data?.estimate) {
        case 'mass':
          result = 'Theo khối lượng'
          break
        case 'fix':
          result = 'Cố định'
          break
        case 'unit':
          result = 'Theo đơn vị'
          break
        case 'accumulated':
          result = 'Theo lũy kế'
          break
        case 'step':
          result = 'Theo bậc thang'
          break
        default:
          break
      }
    }
    return result || ''
  }

  const valuePeriod = () => {
    let result = ''
    if (PlanDataById?.data?.cal_unit) {
      switch (PlanDataById?.data?.cal_unit) {
        case 'day':
          result = ' ngày'
          break
        case 'week':
          result = ' tuần'
          break
        case 'month':
          result = ' tháng'
          break
        case 'year':
          result = ' năm'
          break
        default:
          break
      }
    }
    return PlanDataById?.data?.period ? PlanDataById?.data?.period + result : ''
  }

  return (
    <FormDialog
      resetData={resetData}
      isDone={isSuccess}
      title={t('billing:subcription.create')}
      size="md"
      body={
        <Form<CreateSubcriptionDTO['data'], typeof entitySubcriptionSchema>
          id="create-firm-ware"
          className="flex flex-col justify-between"
          onSubmit={values => {
            mutate({
              data: {
                project_id: projectId,
                plan_id: planValue?.value || '',
                user_id: userId || '',
                register: parseInt(values?.register || ''),
              },
            })
          }}
          options={{
            defaultValues: { plan_id: '' },
          }}
          schema={entitySubcriptionSchema}
        >
          {({ register, formState, control, setError, setValue }) => {
            return (
              <>
                <div className="flex items-center gap-2 rounded-lg bg-secondary-400 px-4 py-2">
                  <div className="flex gap-3">
                    <p className="text-table-header">
                      {t('billing:subcription.popup.customer_info')}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <SelectDropdown
                    isClearable={false}
                    label={t('billing:subcription.popup.search_customer_with')}
                    name="user_id"
                    classnamefieldwrapper="flex items-center gap-x-3"
                    classlabel="w-3/12"
                    classchild="w-9/12"
                    control={control}
                    value={userValue}
                    onChange={e => {
                      const arrValue = e.value.split(' - ')
                      setValue('user_id', e.value)
                      setCustomerName(
                        arrValue[2] !== 'undefined'
                          ? arrValue[2]
                          : 'Tên khách hàng',
                      )
                      setCustomerCode(arrValue[0])
                      setUserId(arrValue[1])
                      setUserValue(e)
                    }}
                    options={
                      UserData?.users?.map(user => ({
                        label: `${user.phone ? user.phone : '(SĐT)'} - ${
                          user.email
                        }`,
                        value: `${user.customer_code} - ${user.user_id} - ${user.name}`,
                      })) || [{ label: '', value: '' }]
                    }
                  />
                </div>
                <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
                  <InputField
                    label={t('billing:subcription.popup.customer_name')}
                    value={customerName}
                    disabled
                  />
                  <InputField
                    label={t('billing:subcription.popup.customer_code')}
                    value={customerCode}
                    disabled
                  />
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-secondary-400 px-4 py-2">
                  <div className="flex gap-3">
                    <p className="text-table-header">
                      {t('billing:subcription.popup.service_info')}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <SelectDropdown
                    isClearable={false}
                    label={t('billing:subcription.popup.package')}
                    name="plan_id"
                    control={control}
                    value={planValue}
                    onChange={e => {
                      setValue('plan_id', e.value)
                      setPlanValue(e)
                      PlanDataById?.data?.estimate !== 'unit' &&
                        handleOnChange()
                    }}
                    options={
                      PlanData?.data?.map(plan => ({
                        label: plan?.name,
                        value: plan?.id,
                      })) || [{ label: '', value: '' }]
                    }
                  />
                  <InputField
                    label={t('billing:subcription.popup.price_method')}
                    value={valuePriceMethod()}
                    disabled
                  />
                  {PlanDataById?.data?.type === 'official' &&
                    PlanDataById?.data?.estimate === 'unit' &&
                    PlanDataById?.data?.payment_type === 'PREPAY' && (
                      <InputField
                        label={t('billing:subcription.popup.quantity')}
                        error={formState.errors['register']}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleOnChange(e.target.value)
                        }
                        registration={register('register')}
                      />
                    )}
                  <InputField
                    label={t('billing:subcription.popup.payment_type')}
                    value={
                      PlanDataById?.data?.payment_type
                        ? PlanDataById?.data?.payment_type === 'PREPAY'
                          ? 'Trả trước'
                          : 'Trả sau'
                        : ''
                    }
                    disabled
                  />
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-secondary-400 px-4 py-2">
                  <div className="flex gap-3">
                    <p className="text-table-header">
                      {t('billing:subcription.popup.billing_info')}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
                  <InputField
                    label={t('billing:subcription.popup.estimated_payment')}
                    value={registerValue}
                    disabled
                  />
                  <InputField
                    label={t('billing:subcription.popup.period')}
                    value={valuePeriod()}
                    disabled
                  />
                </div>
              </>
            )
          }}
        </Form>
      }
      triggerButton={
        <Button
          className="rounded-md"
          variant="trans"
          size="square"
          startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
      }
      confirmButton={
        <Button
          isLoading={isLoading}
          form="create-firm-ware"
          type="submit"
          size="md"
          className="bg-primary-400"
          startIcon={
            <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
          }
        />
      }
    />
  )
}