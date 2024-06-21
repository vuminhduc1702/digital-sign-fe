import { ContentLayout } from '@/layout/ContentLayout'
import { useTranslation } from 'react-i18next'
import { HistoryTable } from '../components/HistoryTable'
import TitleBar from '@/components/Head/TitleBar'

export function HistoryPage() {
  const { t } = useTranslation()
  return (
    <div>
      <ContentLayout title={t('sidebar:history')}>
        <div>
          <TitleBar title={t('history:title')}/>
          <HistoryTable />
        </div>
      </ContentLayout>
    </div>
  )
}
