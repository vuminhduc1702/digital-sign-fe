import { useTranslation } from 'react-i18next'

import { Button } from '~/components/Button'

export function ExportTable() {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-x-1">
      <Button
        className="rounded border-none"
        size="sm"
        variant="secondaryLight"
      >
        {t('table:excel')}
      </Button>
      <Button
        className="rounded border-none"
        size="sm"
        variant="secondaryLight"
      >
        {t('table:pdf')}
      </Button>
      <Button
        className="rounded border-none"
        size="sm"
        variant="secondaryLight"
      >
        {t('table:print')}
      </Button>
    </div>
  )
}
