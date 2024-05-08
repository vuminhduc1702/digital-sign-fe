import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { HiOutlineXMark } from 'react-icons/hi2'
import { PDFViewer } from '@react-pdf/renderer'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import { useBillingById } from '../../api/billingAPI'
import { BillingPDF } from './BillingPDF'

export const entitySubcriptionUpdateSchema = z.object({
  register: z.string(),
})

type ViewBillingProps = {
  id: string
  close: () => void
  isOpen: boolean
}
export function ViewBilling({ id, close, isOpen }: ViewBillingProps) {
  const { t } = useTranslation()
  const cancelButtonRef = useRef(null)

  const { data } = useBillingById({
    id,
  })

  return (
    <Dialog isOpen={isOpen} onClose={() => null} initialFocus={cancelButtonRef}>
      <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-[60rem] sm:p-6 sm:align-middle">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-h1 text-secondary-900">
              {t('billing:manage_bill.service_bill')}
            </DialogTitle>
            <div className="ml-3 flex h-7 items-center">
              <button
                className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                onClick={close}
              >
                <span className="sr-only">Close panel</span>
                <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
          <PDFViewer className="mt-4" height={700} width={'100%'}>
            <BillingPDF dataPdf={data?.data} />
          </PDFViewer>
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
