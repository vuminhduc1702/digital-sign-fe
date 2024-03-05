import { useTranslation } from 'react-i18next'

import { Button } from '~/components/Button'

export function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: { message: string }
  resetErrorBoundary: (...args: unknown[]) => void
}) {
  const { t } = useTranslation()

  return (
    <div
      className="flex grow flex-col items-center justify-center"
      role="alert"
    >
      {import.meta.env.PROD ? (
        <h1 className="text-h1">{t('error:error_page.title')}</h1>
      ) : (
        <h1 className="text-h1">{error.message}</h1>
      )}
      <Button
        className="mt-4"
        size="lg"
        onClick={() => resetErrorBoundary()}
        variant="primary"
      >
        {t('error:refresh')}
      </Button>
    </div>
  )
}
