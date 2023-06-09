import { useTranslation } from 'react-i18next'

import { Button } from '~/components/Button'

export function ErrorFallback({
  resetErrorBoundary,
}: {
  resetErrorBoundary: (...args: unknown[]) => void
}) {
  const { t } = useTranslation()

  return (
    <div
      className="flex grow flex-col items-center justify-center"
      role="alert"
    >
      <h1 className="text-h1">{t('error:error_page.title')}</h1>
      <Button className="mt-4" size="lg" onClick={() => resetErrorBoundary()}>
        Refresh
      </Button>
    </div>
  )
}
