import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { useGetPlans } from '~/cloud/billingPackage/api'
import { usePlanById } from '~/cloud/billingPackage/api/getPackageById'
import { useGetUsers } from '~/cloud/orgManagement/api/userAPI'
import { Button } from '~/components/Button'
import {
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
import { type PlanlvList } from '~/cloud/billingPackage'

export const entitySubcriptionSchema = z.object({
  plan_id: z
    .string()
    .min(1, { message: i18n.t('billing:subcription.popup.choose_plan') }),
  user_id: z
    .string()
    .min(1, { message: i18n.t('billing:subcription.popup.choose_user') }),
  register: z.string().optional(),
})

export function CreateSubcription() {
  const { t } = useTranslation()

  const { id: projectId } = storage.getProject()
  const [userValue, setUserValue] = useState<SelectOptionString | null>()
  const [userId, setUserId] = useState('')
  const [planValue, setPlanValue] = useState<string | null>()
  const [customerName, setCustomerName] = useState('')
  const [customerCode, setCustomerCode] = useState('')
  const [registerValue, setRegisterValue] = useState('')

  const { data: UserData } = useGetUsers({ projectId, expand: true })

  const { data: PlanData } = useGetPlans({ projectId })

  const { data: PlanDataById } = usePlanById({
    planId: planValue || '',
    config: { enabled: !!planValue, suspense: false },
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

  useEffect(() => {
    setTimeout(() => handleOnChange(''), 500)
  }, [PlanDataById, planValue])

  const handleOnChange = (expected_number?: string) => {
    if (PlanDataById?.data) {
      let result: any
      const estimates = PlanDataById?.data?.estimate
      const price = PlanDataById?.data?.price
      const fix_cost = PlanDataById?.data?.fix_cost
      const quantity_free = PlanDataById?.data?.quantity_free
      const plan_lv = PlanDataById?.data?.plan_lv
      const tax = PlanDataById?.data?.tax
      if (estimates === 'fix') {
        result = parseNumber(price) + parseNumber(fix_cost)
      } else if (estimates === 'unit') {
        result =
          (parseNumber(expected_number) - parseNumber(quantity_free)) *
            parseNumber(price) +
          parseNumber(fix_cost)
      } else if (estimates === 'mass') {
        plan_lv?.length &&
          plan_lv.forEach((item: PlanlvList, i: number) => {
            if (
              parseNumber(item.level) > parseNumber(expected_number) &&
              (i > 0 ? parseNumber(plan_lv[i - 1].level) : 1) <
                parseNumber(expected_number)
            ) {
              result =
                (parseNumber(expected_number) - parseNumber(item.free)) *
                  parseNumber(item.price) +
                parseNumber(fix_cost)
            }
          })
      } else if (estimates === 'step') {
        let arr: PlanlvList[] = []
        plan_lv?.length &&
          plan_lv.forEach((item: PlanlvList, i: number) => {
            if (parseNumber(item.level) > parseNumber(expected_number)) {
              arr.length < 1 && arr.push(item)
            }
          })
        result =
          (arr.length ? parseNumber(arr[0].price) : 0) + parseNumber(fix_cost)
      } else if (estimates === 'accumulated') {
        let start = 0
        let end = 0
        let original = parseNumber(expected_number)
        let temp = original
        let index = 0
        let tempPrice = 0

        while (temp > 0) {
          end = parseNumber(plan_lv?.[index]?.level)
          if (original > end) {
            tempPrice += (end - start) * parseNumber(plan_lv?.[index]?.price)
            temp = original - end
          } else {
            tempPrice += temp * parseNumber(plan_lv?.[index]?.price)
            temp = 0
          }
          start = end
          index++
          if (index === plan_lv?.length) {
            tempPrice += temp * parseNumber(plan_lv?.[index - 1]?.price)
            break
          }
        }
        result = tempPrice + parseNumber(fix_cost)
      }

      result = parseNumber(result * ((100 + parseNumber(tax)) / 100))
      setRegisterValue(result < 0 ? 0 : result)
    }
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
  const { register, formState, control, setValue, handleSubmit } = useForm<
    CreateSubcriptionDTO['data']
  >({
    resolver: entitySubcriptionSchema && zodResolver(entitySubcriptionSchema),
    defaultValues: { plan_id: '' },
  })
  return (
    <FormDialog
      resetData={resetData}
      isDone={isSuccess}
      title={t('billing:subcription.create')}
      size="md"
      body={
        <form
          id="create-firm-ware"
          className="flex w-full flex-col justify-between space-y-6"
          onSubmit={handleSubmit(values => {
            mutate({
              data: {
                project_id: projectId,
                plan_id: planValue || '',
                user_id: userId || '',
                register: parseInt(values?.register || ''),
              },
            })
          })}
        >
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
                // value={userValue}
                customOnChange={e => {
                  const arrValue = e.split(' - ')
                  setValue('user_id', e)
                  setCustomerName(
                    arrValue[2] !== 'undefined'
                      ? arrValue[2]
                      : 'Tên khách hàng',
                  )
                  setCustomerCode(arrValue[0])
                  setUserId(arrValue[1])
                  // setUserValue(e)
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
                // value={planValue}
                customOnChange={e => {
                  setValue('plan_id', e)
                  setPlanValue(e)
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
                    onChange={e => handleOnChange(e.target.value)}
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
        </form>
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
