import { useTranslation } from 'react-i18next'
import Iframe from 'react-iframe'

import TitleBar from '~/components/Head/TitleBar'
import { FLOW_URL } from '~/config'
import { useProjectIdStore } from '~/stores/project'
import storage, { type UserStorage } from '~/utils/storage'

export function FlowEngine() {
  const { t } = useTranslation()

  const projectId = useProjectIdStore(state => state.projectId)
  const { token } = storage.getToken() as UserStorage

  return (
    <>
      <TitleBar title={t('flow_engine.title') ?? 'Flow Engine'} />
      <Iframe
        className="mt-3 h-full w-full"
        url={`${FLOW_URL}/ruleChains?token=${token}&project_id=${projectId}`}
      />
    </>
  )
}
