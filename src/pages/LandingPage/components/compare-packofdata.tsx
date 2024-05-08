import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import { HiOutlineXMark } from 'react-icons/hi2'
import { divIcon } from 'leaflet'

type ComparePackOfDataProps = {
  listPackofData: any[] | undefined
  close: () => void
  isOpen: boolean
}

export function ComparePackOfData({
  close,
  isOpen,
  listPackofData,
}: ComparePackOfDataProps) {
  const { t } = useTranslation()
  const cancelButtonRef = useRef(null)
  return (
    <Dialog isOpen={isOpen} onClose={() => null} initialFocus={cancelButtonRef}>
      <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all max-sm:my-8 max-sm:w-full max-sm:max-w-[60rem] max-sm:p-6 max-sm:align-middle">
        <div className="mt-3 text-center max-sm:mt-0 max-sm:text-left">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-h1 text-secondary-900">
              {t('landingpage:pack_of_data_M2M.compare')}
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
          <div className="h-fit max-h-[70vh] overflow-auto">
            <div className="grid grid-flow-col grid-rows-6">
              <div className="border border-solid bg-secondary-400 px-6 py-3 text-left text-base font-medium uppercase">
                Tên gói
              </div>
              <div className="border border-solid px-6 py-3 text-left text-base font-medium uppercase">
                Phí cước
              </div>
              <div className="border border-solid bg-secondary-400 px-6 py-3 text-left text-base font-medium uppercase">
                Mã đăng ký
              </div>
              <div className="border border-solid px-6 py-3 text-left text-base font-medium uppercase">
                Gói cước
              </div>
              <div className="border border-solid bg-secondary-400 px-6 py-3 text-left text-base font-medium uppercase">
                Ưu đãi data/tháng
              </div>
              <div className="border border-solid px-6 py-3 text-left text-base font-medium uppercase">
                Cước thuê bao tháng
              </div>
              {listPackofData?.map((item, idx) => (
                <>
                  <div className="border border-solid bg-secondary-400 px-6 py-3 text-left text-base">
                    {item.name}
                  </div>
                  <div className="border border-solid px-6 py-3 text-left text-base">
                    {item.fee}
                  </div>
                  <div className="border border-solid bg-secondary-400 px-6 py-3 text-left text-base">
                    {item.offerCode}
                  </div>
                  <div className="border border-solid px-6 py-3 text-left text-base">
                    {item.offerType}
                  </div>
                  <div className="border border-solid bg-secondary-400 px-6 py-3 text-left text-base">
                    {item.discountPromotionData}
                  </div>
                  <div className="border border-solid px-6 py-3 text-left text-base">
                    {item.monthlyFee}
                  </div>
                </>
              ))}
            </div>
          </div>
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
