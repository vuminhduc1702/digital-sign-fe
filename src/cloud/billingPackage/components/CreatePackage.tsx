import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import { useState } from 'react'
import btnAddIcon from '~/assets/icons/btn-add.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { Button } from '~/components/Button'
import {
  FormMultipleFields,
  InputField,
  SelectField,
  TextAreaField,
} from '~/components/Form'
import { FormDialog } from '~/components/FormDialog'
import { PlusIcon } from '~/components/SVGIcons'
import { cn } from '~/utils/misc'
import { nameSchema } from '~/utils/schemaValidation'
import storage from '~/utils/storage'
import { useCreatePlan, type CreatePlanDTO } from '../api'
import { type PlanlvList } from '../types'
import i18n from '~/i18n'

export const planlvSchema = z.array(
  z.object({
    level: z.string(),
    price: z.string().nonempty({
      message: i18n.t('billing:package_manage.popup.choose_plan_price'),
    }),
    free: z.string(),
  }),
)

export const entityPlanSchema = z
  .object({
    name: nameSchema,
    type: z.string(),
    status: z.string(),
    description: z.string(),
    payment_type: z.string(),
    type_period: z.string(),
    cal_unit: z.string(),
    fix_cost: z.string(),
    charging_unit: z.string(),
    quantity_free: z.string().optional(),
    price: z.string().optional(),
    tax: z.string().optional(),
    estimate: z.string(),
    expiry: z.string().optional(),
  })
  .and(
    z.discriminatedUnion('estimate', [
      z.object({
        estimate: z.literal('fix'),
      }),
      z.object({
        estimate: z.literal('unit'),
      }),
      z.object({
        estimate: z.literal('mass'),
        plan_lv: planlvSchema,
      }),
      z.object({
        estimate: z.literal('accumulated'),
        plan_lv: planlvSchema,
      }),
      z.object({
        estimate: z.literal('step'),
        plan_lv: planlvSchema,
      }),
    ]),
  )
  .and(
    z.discriminatedUnion('type_period', [
      z.object({
        type_period: z.literal('ONCE'),
        period: z.string(),
      }),
      z.object({
        type_period: z.literal('PERIODIC'),
        period: z.string().nonempty({
          message: i18n.t('billing:package_manage.popup.choose_period'),
        }),
      }),
    ]),
  )

export function CreatePackage() {
  const { t } = useTranslation()

  const { id: projectId } = storage.getProject()
  const [estimates, setEstimates] = useState('fix')
  const [type, setType] = useState('official')
  const [paymentType, setPaymentType] = useState('PREPAY')
  const [periodType, setPeriodType] = useState('PERIODIC')
  const [expectedPayment, setExpectedPayment] = useState('')
  const [expectedNumber, setExpectedNumber] = useState('')

  const { mutate, isLoading, isSuccess } = useCreatePlan()
  const resetData = () => {
    setEstimates('fix')
    setPaymentType('PREPAY')
    setType('official')
    setPeriodType('PERIODIC')
    setExpectedPayment('')
    setExpectedNumber('')
  }

  const parseNumber = (value: any) => {
    return value ? parseInt(value) : 0
  }

  const parseNumberCalUnit = (value: any, type: string) => {
    let result: any
    switch (type) {
      case 'day':
        result = parseNumber(value)
        break
      case 'week':
        result = parseNumber(value) * 7
        break
      case 'month':
        result = parseNumber(value) * 30
        break
      case 'year':
        result = parseNumber(value) * 365
        break
      default:
        break
    }
    return result
  }

  const handleOnChange = (
    expected_number?: string,
    tax?: string,
    price?: string,
    fix_cost?: string,
    quantity_free?: string,
    plan_lv?: PlanlvList[],
  ) => {
    let result: any
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
            (parseNumber(item.level) >= parseNumber(expected_number) ||
              parseNumber(item.level) === 0) &&
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
          if (
            parseNumber(item.level) >= parseNumber(expected_number) ||
            parseNumber(item.level) === 0
          ) {
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
        if (end === 0) {
          end = parseNumber(plan_lv?.[index - 1]?.level)
        }
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
    setExpectedPayment(result < 0 ? parseNumber(fix_cost) : result)
  }

  return (
    <FormDialog
      isDone={isSuccess}
      title={t('billing:package_manage.create')}
      resetData={resetData}
      size="lg"
      body={
        <FormMultipleFields<CreatePlanDTO['data'], typeof entityPlanSchema>
          id="create-plan"
          className="flex flex-col justify-between"
          onSubmit={values => {
            let plan_lvBE: PlanlvList[] = []
            if (
              estimates === 'mass' ||
              estimates === 'accumulated' ||
              estimates === 'step'
            ) {
              plan_lvBE = values.plan_lv?.map(item => ({
                level: (item.level && parseInt(item.level)) || null,
                price: (item.price && parseInt(item.price)) || null,
                free: (item.free && parseInt(item.free)) || null,
                estimate: values.estimate,
              }))
            }
            const expiryNumber =
              values?.expiry && parseInt(values?.expiry) * 24 * 60 * 60
            mutate({
              data: {
                ...values,
                project_id: projectId,
                plan_lv: plan_lvBE,
                tax: (values.tax && parseInt(values.tax)) || null,
                fix_cost:
                  (values.fix_cost && parseInt(values.fix_cost)) || null,
                period: (values.period && parseInt(values.period)) || null,
                quantity_free:
                  (values.quantity_free && parseInt(values.quantity_free)) ||
                  null,
                price: (values.price && parseInt(values.price)) || null,
                expiry: expiryNumber || null,
              },
            })
          }}
          schema={entityPlanSchema}
          name={['plan_lv']}
          options={{
            defaultValues: {
              tax: '10',
              period: '1',
              cal_unit: 'month',
              plan_lv: [
                {
                  level: '',
                  price: '',
                  free: '',
                },
              ],
            },
          }}
        >
          {(
            { register, formState, getValues, setValue, setError },
            {
              append: planlvAppend,
              fields: planlvFields,
              remove: planlvRemove,
            },
          ) => {
            return (
              <>
                <p>{t('billing:package_manage.title')}</p>
                <div className="!mt-2 grid grow grid-cols-1 gap-x-4 gap-y-3 rounded-md border p-4 md:grid-cols-2">
                  <InputField
                    label={t('billing:package_manage.popup.name')}
                    error={formState.errors['name']}
                    registration={register('name')}
                    classnamefieldwrapper="flex items-center gap-x-3"
                    classlabel="w-2/12"
                    classchild="w-10/12"
                  />
                  <SelectField
                    label={t('billing:package_manage.popup.type')}
                    error={formState.errors['type']}
                    registration={register('type', {
                      onChange: e => {
                        setType(e.target.value)
                        setPaymentType('PREPAY')
                      },
                    })}
                    options={[
                      { label: 'Chính thức', value: 'official' },
                      { label: 'Dùng thử', value: 'trial' },
                    ]}
                    classlabel="w-2/12"
                    classchild="w-10/12"
                    classnamefieldwrapper="flex items-center gap-x-3"
                  />
                  <TextAreaField
                    label={t('billing:package_manage.popup.description')}
                    error={formState.errors['description']}
                    registration={register('description')}
                    classnamefieldwrapper="flex items-center gap-x-3"
                    classlabel="w-2/12"
                    classchild="w-10/12"
                  />
                  <SelectField
                    label={t('billing:package_manage.popup.status')}
                    error={formState.errors['status']}
                    registration={register('status')}
                    options={[
                      { label: 'Hiện', value: 'present' },
                      { label: 'Ẩn', value: 'hidden' },
                    ]}
                    classlabel="w-2/12"
                    classchild="w-10/12"
                    classnamefieldwrapper="flex items-center gap-x-3"
                  />
                </div>
                <p>{t('billing:package_manage.popup.data_plan')}</p>
                <div className="!mt-2 grid grow	grid-cols-1 gap-x-4 gap-y-3 rounded-md border p-4 md:grid-cols-2">
                  <SelectField
                    label={t('billing:package_manage.popup.payment_type')}
                    error={formState.errors['payment_type']}
                    registration={register('payment_type', {
                      onChange: e => {
                        setPaymentType(e.target.value)
                        setPeriodType('PERIODIC')
                      },
                    })}
                    options={
                      type === 'trial'
                        ? [{ label: 'Trả trước', value: 'PREPAY' }]
                        : [
                            { label: 'Trả trước', value: 'PREPAY' },
                            { label: 'Trả sau', value: 'POSTPAID' },
                          ]
                    }
                    classlabel="w-2/12"
                    classchild="w-10/12"
                    classnamefieldwrapper="flex items-center gap-x-3"
                  />
                  <div className="flex items-center">
                    {paymentType === 'POSTPAID' && (
                      <InputField
                        label={t('billing:package_manage.popup.expiry')}
                        error={formState.errors['expiry']}
                        registration={register('expiry', {
                          onChange: e => {
                            if (
                              parseNumber(e.target.value) >
                              parseNumberCalUnit(
                                getValues('period'),
                                getValues('cal_unit'),
                              )
                            ) {
                              setError('expiry', {
                                message: t(
                                  'billing:package_manage.popup.choose_expiry',
                                ),
                              })
                            } else setError('expiry', { message: '' })
                          },
                        })}
                        type="number"
                        classnamefieldwrapper="flex items-center gap-x-3"
                        classlabel="w-2/12"
                        classchild="w-10/12"
                      />
                    )}
                  </div>
                  <SelectField
                    label={t('billing:package_manage.popup.type_period')}
                    error={formState.errors['type_period']}
                    registration={register('type_period', {
                      onChange: e => setPeriodType(e.target.value),
                    })}
                    options={
                      type === 'official' && paymentType === 'PREPAY'
                        ? [
                            { label: 'Định kỳ', value: 'PERIODIC' },
                            { label: 'Một lần', value: 'ONCE' },
                          ]
                        : [{ label: 'Định kỳ', value: 'PERIODIC' }]
                    }
                    classlabel="w-2/12"
                    classchild="w-10/12"
                    classnamefieldwrapper="flex items-center gap-x-3"
                  />
                  {periodType === 'PERIODIC' ? (
                    <div
                      className={cn('', {
                        'flex items-center':
                          !formState?.errors?.period?.message,
                      })}
                    >
                      <div className="grid grow	grid-cols-1 gap-x-4 md:grid-cols-4">
                        <div className="flex flex-col gap-2 md:col-span-3">
                          <InputField
                            label={t('billing:package_manage.popup.period')}
                            classlabel="w-[78px]"
                            classchild="w-10/12"
                            registration={register('period')}
                            type="number"
                            min="1"
                            classnamefieldwrapper="flex items-center gap-x-3"
                          />
                        </div>
                        <div className="flex items-center">
                          <SelectField
                            error={formState.errors['cal_unit']}
                            registration={register('cal_unit')}
                            options={[
                              { label: 'Ngày', value: 'day' },
                              { label: 'Tuần', value: 'week' },
                              { label: 'Tháng', value: 'month' },
                              { label: 'Năm', value: 'year' },
                            ]}
                            className="mt-0 px-2"
                          />
                        </div>
                      </div>
                      <p className="text-body-sm text-primary-400">
                        {formState?.errors?.period?.message}
                      </p>
                    </div>
                  ) : (
                    <div></div>
                  )}
                  <InputField
                    label={t('billing:package_manage.popup.fix_cost')}
                    error={formState.errors['fix_cost']}
                    registration={register('fix_cost', {
                      onChange: e => {
                        setExpectedNumber('')
                        setExpectedPayment('')
                      },
                    })}
                    classlabel="w-2/12"
                    classchild="w-10/12"
                    type="number"
                    classnamefieldwrapper="flex items-center gap-x-3"
                  />
                  <SelectField
                    label={t('billing:package_manage.popup.charging_unit')}
                    error={formState.errors['charging_unit']}
                    registration={register('charging_unit')}
                    options={[
                      { label: 'Kết nối', value: 'message' },
                      { label: 'Thiết bị', value: 'device' },
                      { label: 'API', value: 'api' },
                    ]}
                    classlabel="w-2/12"
                    classchild="w-10/12"
                    classnamefieldwrapper="flex items-center gap-x-3"
                  />
                </div>
                <p>{t('billing:package_manage.popup.estimate')}</p>
                <div className="!mt-2 grid grow gap-y-3 rounded-md border p-4">
                  <div className="grid grow	grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2">
                    <SelectField
                      label={t('billing:package_manage.popup.estimate')}
                      error={formState.errors['estimate']}
                      registration={register('estimate', {
                        onChange: e => {
                          setEstimates(e.target.value)
                          setValue('plan_lv', [
                            {
                              level: '',
                              price: '',
                              free: '',
                            },
                          ])
                          setValue('quantity_free', '')
                          setValue('price', '')
                        },
                      })}
                      options={
                        type === 'official' &&
                        paymentType === 'POSTPAID' &&
                        periodType === 'PERIODIC'
                          ? [
                              { label: 'Theo khối lượng', value: 'mass' },
                              { label: 'Cố định', value: 'fix' },
                              { label: 'Theo đơn vị', value: 'unit' },
                              { label: 'Theo lũy kế', value: 'accumulated' },
                              { label: 'Theo bậc thang', value: 'step' },
                            ]
                          : [
                              { label: 'Cố định', value: 'fix' },
                              { label: 'Theo đơn vị', value: 'unit' },
                            ]
                      }
                      classlabel="w-2/12"
                      classchild="w-10/12"
                      classnamefieldwrapper="flex items-center gap-x-3"
                    />
                    {(estimates === 'mass' ||
                      estimates === 'accumulated' ||
                      estimates === 'step') && (
                      <div className="flex items-center">
                        <img
                          onClick={() => {
                            let arrPlan = getValues('plan_lv')
                            const index = getValues('plan_lv')?.length - 1
                            if (arrPlan[index].level) {
                              planlvAppend({
                                level: '',
                                price: '',
                                free: '',
                              })
                            }
                          }}
                          src={btnAddIcon}
                          alt="add-icon"
                          className="h-5 w-5 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                  <div className="max-h-[122px] overflow-auto">
                    {estimates === 'mass' ||
                    estimates === 'accumulated' ||
                    estimates === 'step'
                      ? planlvFields.map((field, index) => {
                          return (
                            <section className="flex w-full" key={field.id}>
                              <div
                                className={cn(
                                  'grid w-full grid-cols-1 gap-x-4',
                                  {
                                    'md:grid-cols-2':
                                      estimates === 'accumulated' ||
                                      estimates === 'step',
                                    'md:grid-cols-3': estimates === 'mass',
                                  },
                                )}
                              >
                                <InputField
                                  label={
                                    estimates === 'step'
                                      ? t('billing:package_manage.popup.max')
                                      : t(
                                          'billing:package_manage.popup.level',
                                        ).replace(
                                          '{{NUMBER}}',
                                          index >= 1
                                            ? getValues('plan_lv')?.[
                                                index - 1
                                              ].level?.toString()
                                            : '1',
                                        )
                                  }
                                  registration={register(
                                    `plan_lv.${index}.level`,
                                    {
                                      onChange: e => {
                                        setExpectedNumber('')
                                        setExpectedPayment('')
                                      },
                                    },
                                  )}
                                  onBlur={e => {
                                    if (
                                      index ===
                                        getValues('plan_lv').length - 1 &&
                                      e.target.value
                                    ) {
                                      planlvAppend({
                                        level: '',
                                        price: '',
                                        free: '',
                                      })
                                    }
                                  }}
                                  classlabel="w-2/12"
                                  classchild="w-10/12"
                                  type="number"
                                  classnamefieldwrapper="flex items-center gap-x-3"
                                />
                                <div>
                                  <InputField
                                    label={
                                      estimates === 'step'
                                        ? t(
                                            'billing:package_manage.popup.price',
                                          )
                                        : t(
                                            'billing:package_manage.popup.unit_price',
                                          )
                                    }
                                    registration={register(
                                      `plan_lv.${index}.price`,
                                      {
                                        onChange: e => {
                                          setExpectedNumber('')
                                          setExpectedPayment('')
                                        },
                                      },
                                    )}
                                    classlabel="w-2/12"
                                    classchild="w-10/12"
                                    min="1"
                                    type="number"
                                    classnamefieldwrapper="flex items-center gap-x-3"
                                  />
                                  <p className="text-body-sm text-primary-400">
                                    {
                                      formState?.errors?.plan_lv?.[index]?.price
                                        ?.message
                                    }
                                  </p>
                                </div>
                                {estimates === 'mass' && (
                                  <InputField
                                    label={t(
                                      'billing:package_manage.popup.free',
                                    )}
                                    registration={register(
                                      `plan_lv.${index}.free`,
                                      {
                                        onChange: e => {
                                          setExpectedNumber('')
                                          setExpectedPayment('')
                                        },
                                      },
                                    )}
                                    classlabel="w-2/12"
                                    classchild="w-10/12"
                                    type="number"
                                    classnamefieldwrapper="flex items-center gap-x-3"
                                  />
                                )}
                              </div>
                              <Button
                                type="button"
                                size="square"
                                variant="trans"
                                className="mt-1 border-none shadow-none"
                                onClick={() => planlvRemove(index)}
                                startIcon={
                                  <img
                                    src={btnDeleteIcon}
                                    alt="Delete condition"
                                    className="h-6 w-6"
                                  />
                                }
                              />
                            </section>
                          )
                        })
                      : null}
                  </div>
                  {(estimates === 'fix' || estimates === 'unit') && (
                    <div className="grid grow	grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2">
                      <InputField
                        label={t('billing:package_manage.popup.price')}
                        error={formState.errors['price']}
                        registration={register('price', {
                          onChange: e => {
                            if (estimates === 'fix') {
                              handleOnChange(
                                '',
                                getValues('tax'),
                                e.target.value,
                                getValues('fix_cost'),
                                getValues('quantity_free'),
                                getValues('plan_lv'),
                              )
                            } else {
                              setExpectedNumber('')
                              setExpectedPayment('')
                            }
                          },
                        })}
                        classnamefieldwrapper="flex items-center gap-x-3"
                        classlabel="w-2/12"
                        classchild="w-10/12"
                        type="number"
                      />
                      {estimates === 'unit' && (
                        <InputField
                          label={t(
                            'billing:package_manage.popup.quantity_free',
                          )}
                          error={formState.errors['quantity_free']}
                          registration={register('quantity_free', {
                            onChange: e => {
                              setExpectedNumber('')
                              setExpectedPayment('')
                            },
                          })}
                          classnamefieldwrapper="flex items-center gap-x-3"
                          classlabel="w-2/12"
                          classchild="w-10/12"
                          type="number"
                        />
                      )}
                    </div>
                  )}
                </div>
                <p>{t('billing:package_manage.popup.estimated_payment')}</p>
                <div className="!mt-2 grid grow	grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2">
                  <InputField
                    label={t('billing:package_manage.popup.tax')}
                    error={formState.errors['tax']}
                    registration={register('tax')}
                    classlabel="w-2/12"
                    classchild="w-10/12"
                    classnamefieldwrapper="flex items-center gap-x-3"
                  />
                  <div className="flex items-center">(mặc định 10%)</div>
                  {estimates !== 'fix' && (
                    <InputField
                      label={t('billing:package_manage.popup.expected_number')}
                      onChange={e => {
                        setExpectedNumber(e.target.value)
                        handleOnChange(
                          e.target.value,
                          getValues('tax'),
                          getValues('price'),
                          getValues('fix_cost'),
                          getValues('quantity_free'),
                          getValues('plan_lv'),
                        )
                      }}
                      value={expectedNumber}
                      classlabel="w-2/12"
                      classchild="w-10/12"
                      classnamefieldwrapper="flex items-center gap-x-3"
                    />
                  )}
                  <InputField
                    label={t('billing:package_manage.popup.expected_payment')}
                    disabled
                    value={expectedPayment}
                    placeholder=""
                    classlabel="w-2/12"
                    classchild="w-10/12"
                    classnamefieldwrapper="flex items-center gap-x-3"
                  />
                </div>
              </>
            )
          }}
        </FormMultipleFields>
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
          form="create-plan"
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
