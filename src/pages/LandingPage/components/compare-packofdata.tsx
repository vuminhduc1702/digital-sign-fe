import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/Button'
import { Dialog, DialogTitle } from '~/components/Dialog'
import { XMarkIcon } from '@heroicons/react/24/outline'

type ComparePackOfDataProps = {
  close: () => void
  isOpen: boolean
}

export function ComparePackOfData({ close, isOpen }: ComparePackOfDataProps) {
  const { t } = useTranslation()
  const cancelButtonRef = useRef(null)
  return (
    <Dialog isOpen={isOpen} onClose={() => null} initialFocus={cancelButtonRef}>
      <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-[60rem] sm:p-6 sm:align-middle">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <div className="flex items-center justify-between">
            <DialogTitle as="h3" className="text-h1 text-secondary-900">
              {t('billing:manage_bill.service_bill')}
            </DialogTitle>
            <div className="ml-3 flex h-7 items-center">
              <button
                className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                onClick={close}
              >
                <span className="sr-only">Close panel</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
          {/* <PDFViewer className='mt-4' height={700} width={"100%"}>
            <BillingPDF dataPdf={data?.data} />
          </PDFViewer> */}
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
