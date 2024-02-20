import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/Button'

import { XMarkIcon } from '@heroicons/react/24/outline'
import { useGetBillings } from '~/cloud/billing/api/billingAPI'
import { useGetSubcriptons } from '~/cloud/subcription/api/subcriptionAPI'
import { Dialog, DialogTitle } from '~/components/Dialog'
import storage from '~/utils/storage'
import { PaymentHistoryTable } from './PaymentHistoryTable'
import { SignHistoryTable } from './SignHistoryTable'

type ViewPopupProps = {
  id: string
  close: () => void
  isOpen: boolean
  type: string
  customerCode?: string
  customerName?: string
}
export function ViewPopup({
  id,
  close,
  isOpen,
  type,
  customerCode,
  customerName,
}: ViewPopupProps) {
  const { t } = useTranslation()
  const projectId = storage.getProject()?.id
  const cancelButtonRef = useRef(null)
  const [offset, setOffset] = useState(0)

  const { data, isPreviousData } = useGetSubcriptons({
    projectId,
    searchData: {
      user_id: id,
    },
    config: { keepPreviousData: true, suspense: false },
  })

  const { data: dataBill, isPreviousData: isPrevious } = useGetBillings({
    projectId,
    searchData: {
      customer_name: customerName || '',
    },
    config: { keepPreviousData: true, suspense: false },
  })

  return (
    <Dialog isOpen={isOpen} onClose={() => null} initialFocus={cancelButtonRef}>
      <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-[60rem] sm:p-6 sm:align-middle">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <div className="flex items-center justify-between">
            <DialogTitle className="mx-auto text-3xl font-semibold">
              {type === 'payment'
                ? t('billing:customer_manage.payment_history')
                : t('billing:customer_manage.sign_history')}
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
          <>
            <div className="mt-2">
              <div className="mb-2 flex items-center gap-3">
                <p className="text-table-header">
                  {t('billing:customer_manage.table.customer_id')}:{' '}
                  {customerCode}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-table-header">
                  {t('billing:customer_manage.table.customer_name')} :{' '}
                  {customerName}
                </p>
              </div>
            </div>
            <div className="max-h-96 overflow-auto">
              {type === 'payment' ? (
                <PaymentHistoryTable
                  data={dataBill?.data?.data}
                  offset={offset}
                  setOffset={setOffset}
                  total={0}
                  isPreviousData={isPrevious}
                />
              ) : (
                <SignHistoryTable
                  data={data?.data?.data}
                  offset={offset}
                  setOffset={setOffset}
                  total={data?.data?.total ?? 0}
                  isPreviousData={isPreviousData}
                />
              )}
            </div>
          </>
        </div>
        <div className="mt-4 flex justify-center space-x-2">
          <Button
            type="button"
            className="rounded-md"
            variant="trans"
            onClick={close}
            ref={cancelButtonRef}
          >
            {t('btn:close')}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
