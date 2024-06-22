import { useTranslation } from 'react-i18next'
import { SignForm } from '../components/SignForm'
import { ContentLayout } from '@/layout/ContentLayout'
import TitleBar from '@/components/Head/TitleBar'

export function SignPage() {
  const {t} = useTranslation()
  return (
    <div>
      <ContentLayout title={t('sidebar:sign')}>
        <div>
          <TitleBar title={t('sign:title')}/>
          <SignForm />
        </div>
      </ContentLayout>
    </div>
  )
}
