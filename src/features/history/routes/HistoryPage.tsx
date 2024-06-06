import { ContentLayout } from '@/layout/ContentLayout'
import { useTranslation } from 'react-i18next'
import { HistoryTable } from '../components/HistoryTable'

export function HistoryPage() {
  const { t } = useTranslation()
  return (
    <div>
      <ContentLayout title={t('sidebar:history')}>
        <div>
          <HistoryTable />
        </div>
      </ContentLayout>
    </div>
  )
}
