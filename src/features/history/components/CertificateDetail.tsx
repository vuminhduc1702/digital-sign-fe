import { type ActiveCertificate } from '@/features/certificate/api/getActiveCertificate'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

type CertificateProps = {
  certificate: ActiveCertificate
}

export function CertificateDetail({ certificate }: CertificateProps) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-flow-col grid-rows-3 gap-3 rounded-lg bg-secondary-400 p-4 my-4">
      <div className="grid grid-cols-4">
        <p>{t('history:cert_info.cert_name')}:</p>
        <p className="col-span-3 font-semibold">{certificate.commonName}</p>
      </div>
      <div className="grid grid-cols-4">
        <p>{t('history:cert_info.subject')}:</p>
        <p className="col-span-3 font-semibold">{certificate.subjectName}</p>
      </div>
      <div className="grid grid-cols-4">
        <p>{t('history:cert_info.serial')}:</p>
        <p className="col-span-3 font-semibold">{certificate.serialNumber}</p>      
      </div>
      <div className="grid grid-cols-4">
        <p>{t('history:cert_info.date')}:</p>
        <p className="col-span-3 font-semibold">{moment(certificate.notValidBefore).format('DD/MM/yyyy')} - {moment(certificate.notValidAfter).format('DD/MM/yyyy')}</p>
      </div>
      <div className="grid grid-cols-4">
        <p>{t('history:cert_info.status')}:</p>
        <p className="col-span-3 font-semibold">{certificate.statusName}</p>
      </div>
    </div>
  )
}
