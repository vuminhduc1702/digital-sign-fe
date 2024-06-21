import { ContentLayout } from '@/layout/ContentLayout'
import { VerifyForm } from '../components/VerifyForm'
import TitleBar from '@/components/Head/TitleBar'
import { useTranslation } from 'react-i18next'

export function VerifyPage() {
  const { t } = useTranslation()
  return (
    <div>
      <ContentLayout title={t('sidebar:verify')}>
        <div>
          <TitleBar title={t('verify:title')} />
          <VerifyForm />
        </div>
      </ContentLayout>
    </div>
  )
}
