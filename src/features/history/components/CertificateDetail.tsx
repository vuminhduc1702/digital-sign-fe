import { type ActiveCertificate } from '@/features/certificate/api/getActiveCertificate'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

type CertificateProps = {
  certificate: ActiveCertificate
}

export function CertificateDetail({ certificate }: CertificateProps) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-flow-col grid-rows-3">
      <p>{`${t('history:cert_info.cert_name')}: ${certificate.commonName}`}</p>
      <p>{`${t('history:cert_info.subject')}: ${certificate.subjectName}`}</p>
      <p>{`${t('history:cert_info.serial')}: ${certificate.serialNumber}`}</p>
      <p>{`${t('history:cert_info.date')}: ${moment(certificate.notValidBefore).format('DD/mm/yyyy')} - ${moment(certificate.notValidAfter).format('DD/mm/yyyy')}`}</p>
      <p>{`${t('history:cert_info.status')}: ${certificate.statusName}`}</p>
    </div>
  )
}
