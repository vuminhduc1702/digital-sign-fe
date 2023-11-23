import { useTranslation } from 'react-i18next'

import { QuestionMarkCircledIcon } from '@radix-ui/react-icons'
import { useNavigate } from 'react-router-dom'

export function OverViewSidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <>
      <div className="flex h-[60px] items-center gap-2 bg-secondary-400 px-4 py-3">
        <div className="flex gap-3">
          <QuestionMarkCircledIcon className="h-5 w-5" />
          <p onClick={() => navigate(`/cloud/dashboard/02704fbd-1a0a-4cdc-af1a-35460d8d3f29?openDrawer=true`)}>{t('nav:manual')}</p>
        </div>
      </div>
      <div className="h-[82vh] grow overflow-y-auto bg-secondary-500 p-3"></div>
    </>
  )
}
