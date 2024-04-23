import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { PATHS } from '@/routes/PATHS'

export function NotFoundPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    // const timer = setTimeout(() => navigate(PATHS.HOME), 5000)
    const timer = setTimeout(() => navigate(PATHS.PROJECT_MANAGE), 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex h-screen items-center justify-center">
      <h1 className="text-h1">{t('error:page_not_found')}</h1>
    </div>
  )
}
