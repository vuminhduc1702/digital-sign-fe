import { useTranslation } from 'react-i18next'
import Iframe from 'react-iframe'

import TitleBar from '~/components/Head/TitleBar'
import { FLOW_URL } from '~/config'
import { ContentLayout } from '~/layout/ContentLayout'
import storage from '~/utils/storage'

export function FlowEngine() {
  const { t } = useTranslation()

  const { id: projectId } = storage.getProject()
  const { token } = storage.getToken()

  return (
    <ContentLayout title={t('sidebar:cloud.flow_engine')}>
      <TitleBar title={t('flow_engine:title')} />
      <Iframe
        className="mt-3 h-full w-full"
        url={`${FLOW_URL}/ruleChains?token=${token}&project_id=${projectId}`}
      />
    </ContentLayout>
  )
}
