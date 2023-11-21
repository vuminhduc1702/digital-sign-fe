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
import dollarIcon from '~/assets/icons/currency-dollar1.svg'
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
      <div className="flex h-[60px] items-center gap-3 rounded-md bg-secondary-400 px-4 py-3">
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
        <ComboBoxSelectPackage 
          setFilteredComboboxData={setFilteredComboboxData}
        />
        </div>
      </div>
      <div className="h-[80vh] grow overflow-y-auto bg-secondary-400 p-5">
        {filteredComboboxData?.length > 0 ? (
          <div className="space-y-3">
            {filteredComboboxData?.map((plan: PlanFilter) => (
              <div className="w-full h-full cursor-pointer" key={plan.id}>
                  <div
                    className={clsx('flex items-center w-full rounded-md border', {
                      'text-white bg-primary-400 ': packageId === plan.id,
                    })}
                    key={plan.id}
                    onClick={() =>
                      navigate(`${PATHS.BILLING_PACKAGE}/${projectId}/${plan.id}`)
                    }
                  >
                    <div className="icon-container w-10 h-10 flex items-center justify-center bg-gray-200 rounded-md ml-2">
                      <img
                        src={dollarIcon}
                        alt="full_screen"
                        className="aspect-square w-[24px]"
                      />
                    </div>
                    <div className="ml-3 p-2">
                      <p
                        className={clsx('my-auto text-base', {
                          'text-white bg-primary-400': packageId === plan.id,
                        })}
                      >
                        {plan.name}
                      </p>
                      <div className='mt-1'>
                        {/* <div><span>{t('billing:package_manage.id')}:</span> {plan.id}</div> */}
                        <div><span>{t('billing:package_manage.description')}</span> {plan.description}</div>
                      </div>
                    </div>
                  </div>  
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            {t('cloud:device_template.sidebar.no_template')}
          </div>
        )}
      </div>
    </>
  )
}
