import { useTranslation } from 'react-i18next'
import { Button } from '~/components/Button'

import narrowLeft from '~/assets/icons/narrow-left.svg'
import { useNavigate } from 'react-router-dom';

export function InfoCustomer() {
  const { t } = useTranslation()
  const navigate = useNavigate();

  return (
    <>
      <div>
        <Button
          className="pr-5"
          variant="trans"
          size="square"
          onClick={() => navigate(-1)}
          startIcon={
            <img src={narrowLeft} alt="Delete thing" className="h-5 w-5" />
          }
        >
          <span>{t('btn:back')}</span>
        </Button>
      </div>
    </>
  )
}
