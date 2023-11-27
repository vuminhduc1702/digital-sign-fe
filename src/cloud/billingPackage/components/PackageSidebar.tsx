import clsx from 'clsx'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '~/components/Button'
import { PATHS } from '~/routes/PATHS'
import storage from '~/utils/storage'
import { ComboBoxSelectPackage } from './ComboBoxSelectPackage'

import { type PlanFilter } from '../types'

import listIcon from '~/assets/icons/list.svg'
import { CreatePackage } from './CreatePackage'

export function PackageSidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { packageId } = useParams()

  const { id: projectId } = storage.getProject()

  const [filteredComboboxData, setFilteredComboboxData] = useState<
    PlanFilter[]
  >([])

  return (
    <>
      <div className="flex h-[60px] items-center gap-2 bg-secondary-400 px-4 py-3">
        <div className="flex gap-3">
          <img
            src={listIcon}
            alt="Template list"
            className="aspect-square w-[20px]"
          />
          <p>{t('billing:package_manage.list_package')}</p>
        </div>
        <CreatePackage />
        <ComboBoxSelectPackage
          setFilteredComboboxData={setFilteredComboboxData}
        />
      </div>
      <div className="h-[82vh] grow overflow-y-auto bg-secondary-500 p-3">
        {filteredComboboxData?.length > 0 ? (
          <div className="space-y-3">
            {filteredComboboxData?.map((plan: PlanFilter) => (
              <div className="w-full" key={plan.id}>
                <Button
                  className={clsx('w-full gap-y-3 rounded border-none bg-stone-300 px-6', {
                    'text-white bg-primary-400': packageId === plan.id,
                  })}
                  key={plan.id}
                  variant="muted"
                  onClick={() =>
                    navigate(`${PATHS.BILLING_PACKAGE}/${projectId}/${plan.id}`)
                  }
                >
                  <p
                    className={clsx('my-auto', {
                      'text-white bg-primary-400': packageId === plan.id,
                    })}
                  >
                    {plan.name}
                  </p>
                </Button>
                <div className='grid grow gap-x-4 gap-y-3 bg-white p-4 '>
                  <div><span>{t('billing:package_manage.id')}:</span> {plan.id}</div>
                  <div><span>{t('billing:package_manage.description')}:</span> {plan.description}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            {t('billing:package_manage.no_package')}
          </div>
        )}
      </div>
    </>
  )
}
