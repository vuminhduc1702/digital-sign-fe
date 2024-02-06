import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '~/components/Button'
import { InputField } from '~/components/Form'
import {
  useDeleteSubcription,
  useSubcriptionById,
  useUpdateSubcription,
  type UpdateSubcriptionDTO,
} from '../../api/subcriptionAPI'

import { XMarkIcon } from '@heroicons/react/24/outline'
import * as z from 'zod'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Dialog, DialogTitle } from '~/components/Dialog'
import { getVNDateFormat } from '~/utils/misc'
import storage from '~/utils/storage'

export const entitySubcriptionUpdateSchema = z.object({
  register: z.string(),
})

type UpdateSubcriptionProps = {
  id: string
  close: () => void
  isOpen: boolean
}
export function UpdateSubcription({
  id,
  close,
  isOpen,
}: UpdateSubcriptionProps) {
  const { t } = useTranslation()
  const [isUpdate, setIsUpdate] = useState(false)
  const cancelButtonRef = useRef(null)

  const { data, refetch } = useSubcriptionById({
    id,
    config: { suspense: false },
  })

  const { mutateAsync, isLoading, isSuccess } = useUpdateSubcription()

  const {
    mutate: mutateDelete,
    isLoading: isLoadingDelete,
    isSuccess: isSuccessDelete,
  } = useDeleteSubcription()

  useEffect(() => {
    if (isSuccess || isSuccessDelete) {
      close()
    }
  }, [isSuccess, close, isSuccessDelete])

  const valuePriceMethod = () => {
    let result = ''
    if (data?.data?.p_estimate) {
      switch (data?.data?.p_estimate) {
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
    if (data?.data?.p_cal_unit) {
      switch (data?.data?.p_cal_unit) {
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
    return data?.data?.p_period ? data?.data?.p_period + result : ''
  }

  const valueStatus = () => {
    let result = ''
    if (data?.data?.s_status) {
      switch (data?.data?.s_status) {
        case 'Active':
          result = 'Hoạt động'
          break
        case 'Pending Cancel':
          result = 'Chờ hủy'
          break
        case 'Cancelled':
          result = 'Đã hủy'
          break
        case 'Pending Active':
          result = 'Chờ kích hoạt'
          break
        case 'Finished':
          result = 'Đã kết thúc'
          break
        default:
          break
      }
    }
    return result
  }
  const { register, formState, handleSubmit } = useForm<
    UpdateSubcriptionDTO['data']
  >({
    resolver:
      entitySubcriptionUpdateSchema &&
      zodResolver(entitySubcriptionUpdateSchema),
    values: {
      register: data?.data?.s_register?.toString() || '',
    },
  })
  return (
    <Dialog isOpen={isOpen} onClose={() => null} initialFocus={cancelButtonRef}>
      <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-[48rem] sm:p-6 sm:align-middle">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <div className="flex items-center justify-between">
            <DialogTitle className="mx-auto text-2xl font-semibold ">
              {isUpdate
                ? t('billing:subcription.edit')
                : t('billing:subcription.title')}
            </DialogTitle>
            <div className="flex h-7 items-center">
              <button
                className="text-secondary-900 hover:text-secondary-700 focus:ring-secondary-600 rounded-md bg-white focus:outline-none focus:ring-2"
                onClick={close}
              >
                <span className="sr-only">Close panel</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
          <form
            id="update-subcription"
            className="flex w-full flex-col justify-between space-y-6"
            onSubmit={handleSubmit(async values => {
              await mutateAsync({
                data: {
                  register: parseInt(values.register),
                },
                id: id || '',
              })
              refetch()
            })}
          >
            <>
              <div className="mt-2 flex justify-between gap-2 py-2 ">
                <div className="flex items-center gap-3">
                  <p className="text-lg font-semibold">
                    {t('billing:subcription.table.sub_code')} : {id}
                  </p>
                </div>
                {(data?.data?.s_status === 'Active' ||
                  data?.data?.s_status === 'Pending Active') &&
                  !isUpdate && (
                    <div>
                      <ConfirmationDialog
                        isDone={isSuccess}
                        icon="danger"
                        title={t('billing:subcription.delete')}
                        body={t(
                          'billing:subcription.delete_sub_confirm',
                        ).replace('{{SUBCRIPTION}}', id)}
                        triggerButton={
                          <Button
                            className="w-full rounded-md border-none bg-orange-500 text-white shadow-none"
                            style={{ justifyContent: 'flex-start' }}
                            variant="trans"
                            size="square"
                          >
                            {t('billing:subcription.delete')}
                          </Button>
                        }
                        confirmButton={
                          <Button
                            isLoading={isLoadingDelete}
                            type="button"
                            size="md"
                            className="bg-primary-400"
                            onClick={() => mutateDelete({ id })}
                            startIcon={
                              <img
                                src={btnSubmitIcon}
                                alt="Submit"
                                className="h-5 w-5"
                              />
                            }
                          />
                        }
                      />
                    </div>
                  )}
              </div>
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-gray-200 px-3 py-2 ">
                <div className="flex gap-3">
                  <p className="text-lg font-semibold">
                    {t('billing:subcription.popup.customer_info')}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
                <InputField
                  label={t('billing:subcription.popup.customer_name')}
                  disabled
                  value={data?.data?.c_name || ''}
                />
                <InputField
                  label={t('billing:subcription.popup.customer_code')}
                  value={data?.data?.c_customer_code || ''}
                  disabled
                />
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-gray-200 px-3 py-2">
                <div className="flex gap-3">
                  <p className="text-lg font-semibold">
                    {t('billing:subcription.popup.service_info')}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField
                  label={t('billing:subcription.popup.package')}
                  value={data?.data?.p_name || ''}
                  disabled
                />
                <InputField
                  label={t('billing:subcription.table.status')}
                  disabled
                  value={valueStatus()}
                />
                <InputField
                  label={t('billing:subcription.popup.price_method')}
                  disabled
                  value={valuePriceMethod()}
                />
                {data?.data?.p_estimate !== 'fix' && (
                  <InputField
                    label={t('billing:subcription.popup.quantity')}
                    disabled={!isUpdate}
                    error={formState.errors['register']}
                    registration={register('register')}
                  />
                )}
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-gray-200 px-3 py-2">
                <div className="flex gap-3">
                  <p className="text-lg font-semibold">
                    {t('billing:subcription.popup.billing_info')}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField
                  label={t('billing:subcription.popup.payment_type')}
                  disabled
                  value={
                    data?.data?.p_payment_type
                      ? data?.data?.p_payment_type === 'PREPAY'
                        ? 'Trả trước'
                        : 'Trả sau'
                      : ''
                  }
                />
                <InputField
                  label={t('billing:subcription.table.start_date')}
                  disabled
                  value={getVNDateFormat({
                    date: (data?.data?.s_date_register || 0) * 1000,
                  })}
                />
                <InputField
                  label={t('billing:subcription.popup.period')}
                  disabled
                  value={valuePeriod()}
                />
                <InputField
                  label={t('billing:subcription.table.cycle_now')}
                  disabled
                  value={data?.data?.s_cycle_now || ''}
                />
              </div>
            </>
          </form>
        </div>
        <div className="mt-4 flex justify-center space-x-3">
          {!isUpdate ? (
            <>
              <Button
                type="button"
                className="w-[100px] rounded-md"
                variant="trans"
                onClick={close}
                ref={cancelButtonRef}
              >
                {t('btn:close')}
              </Button>
              {data?.data?.s_status !== 'Cancelled' && (
                <Button
                  onClick={() => setIsUpdate(true)}
                  size="md"
                  className="bg-primary-400 w-[100px] rounded-md"
                >
                  {t('btn:update')}
                </Button>
              )}
            </>
          ) : (
            <Button
              isLoading={isLoading}
              form="update-subcription"
              type="submit"
              size="md"
              className="bg-primary-400 "
            >
              {t('btn:save')}
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  )
}
