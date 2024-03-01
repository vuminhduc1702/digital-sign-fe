import clsx from 'clsx'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '~/components/Button'
import { PATHS } from '~/routes/PATHS'
import storage from '~/utils/storage'

import { type PlanFilter } from '../types'

import listIcon from '~/assets/icons/list.svg'
import dollarIcon from '~/assets/icons/currency-dollar1.svg'
import { CreatePackage } from './CreatePackage'
import { useGetPlans } from '../api'
import { flattenData } from '~/utils/misc'
import { SearchField } from '~/components/Input'

export function PackageSidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { packageId } = useParams()

  const projectId = storage.getProject()?.id

  const [searchQuery, setSearchQuery] = useState('')
  const { data } = useGetPlans({ projectId })

  const { acc: planFlattenData, extractedPropertyKeys } = flattenData(
    data?.data,
    ['id', 'name', 'description'],
  )

  return (
    <>
      <div className="bg-secondary-400 flex h-[60px] items-center gap-3 rounded-md px-4 py-3">
        <div className="flex gap-3">
          <img
            src={listIcon}
            alt="Template list"
            className="aspect-square w-[45px]"
          />
          {/* <p>{t('billing:package_manage.list_package')}</p> */}
        </div>
        <CreatePackage />
        <div className="w-full">
          <SearchField
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
      </div>
      <div className="bg-secondary-400 h-[80vh] grow overflow-y-auto p-5">
        {planFlattenData?.length > 0 ? (
          <div className="space-y-3">
            {planFlattenData?.map((plan: PlanFilter) => (
              <div className="h-full w-full cursor-pointer" key={plan.id}>
                <div
                  className={clsx(
                    'flex w-full items-center rounded-md border',
                    {
                      'bg-primary-400 text-white ': packageId === plan.id,
                    },
                  )}
                  key={plan.id}
                  onClick={() =>
                    navigate(`${PATHS.BILLING_PACKAGE}/${projectId}/${plan.id}`)
                  }
                >
                  <div className="icon-container ml-2 flex h-10 w-10 items-center justify-center rounded-md bg-gray-200">
                    <img
                      src={dollarIcon}
                      alt="full_screen"
                      className="aspect-square w-[24px]"
                    />
                  </div>
                  <div className="ml-3 p-2">
                    <p
                      className={clsx('my-auto text-base', {
                        'bg-primary-400 text-white': packageId === plan.id,
                      })}
                    >
                      {plan.name}
                    </p>
                    <div className="mt-1">
                      {/* <div><span>{t('billing:package_manage.id')}:</span> {plan.id}</div> */}
                      <div>
                        <span>{t('billing:package_manage.description')}</span>{' '}
                        {plan.description}
                      </div>
                    </div>
                  </div>
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
