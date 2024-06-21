import { ContentLayout } from '@/layout/ContentLayout'
import { CertificateTable } from '../components/CertificateTable'
import { t } from 'i18next'
import { useTranslation } from 'react-i18next'
import TitleBar from '@/components/Head/TitleBar'

export function CertificatePage() {
  const { t } = useTranslation()
  return (
    <div>
      <ContentLayout title={t('sidebar:certificate')}>
        <div>
          <TitleBar title={t('certificate:title')} />
          <CertificateTable />
        </div>
      </ContentLayout>
    </div>
  )
}
