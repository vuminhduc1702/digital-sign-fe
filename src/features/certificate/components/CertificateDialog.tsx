import { Dialog, DialogTitle } from '@/components/ui/dialog'
import { Certificate } from '../types'
import { HiOutlineXMark } from 'react-icons/hi2'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

export type CertificateDialogProps = {
  close: () => void
  isOpen: boolean
  data?: Certificate
}

export function CertificateDialog({
  isOpen,
  close,
  data,
}: CertificateDialogProps) {
  const { t } = useTranslation()
  return (
    <Dialog isOpen={isOpen} onClose={close}>
      <div className="inline-block transform rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-6 sm:align-middle">
        <div className="absolute -right-3 -top-3">
          <button
            className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
            onClick={close}
          >
            <span className="sr-only">Close panel</span>
            <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <div className="mb-4 flex items-center justify-center">
            <DialogTitle className="text-h1 text-secondary-900">
              Thông tin chứng thư số
            </DialogTitle>
          </div>
          <div>
            <div>
              <p>Loại chứng thư số: </p>
              <p>{data?.typeName}</p>
            </div>
            <div>
              <p>Chủ thể: </p>
              <p>{data?.commonName}</p>
            </div>
            <div>
              <p>Nhà phát hành: </p>
              <p>{data?.issuerName}</p>
            </div>
            <div>
              <p>Trạng thái: </p>
              <p>{data?.statusName}</p>
            </div>
            <div>
              <p>Hiệu lực: </p>
              <p>
                {moment(data?.notValidBefore).format('HH:mm:ss DD/MM/YYYY')} -{' '}
                {moment(data?.notValidAfter).format('HH:mm:ss DD/MM/YYYY')}
              </p>
            </div>
            <div>
              <p>Serial Number</p>
              <p>{data?.serialNumber}</p>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
