import { useTranslation } from 'react-i18next'
import { Button } from '~/components/Button'

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import narrowLeft from '~/assets/icons/narrow-left.svg'
import { useGetSubcriptons } from '~/cloud/subcription/api/subcriptionAPI'
import { InputField } from '~/components/Form'
import { useDisclosure } from '~/utils/hooks'
import storage from '~/utils/storage'
import { useGetCustomers } from '../../api/customerManageAPI'
import { type Customer } from '../../types'
import { PlanTable } from './PlanTable'
import { ViewPopup } from './ViewPopup'

export function InfoCustomer() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [offset, setOffset] = useState(0)
  const [type, setType] = useState('')
  const [userById, setUserById] = useState<Customer | null>()
  const projectId = storage.getProject()?.id

  const params = useParams()

  const customerId = params.customerId as string

  const { data, isPreviousData } = useGetSubcriptons({
    projectId,
    searchData: {
      status: 'Active',
      user_id: customerId,
    },
    config: { keepPreviousData: true, staleTime: 1000 },
  })

  const { data: dataUsers } = useGetCustomers({
    projectId,
    config: { keepPreviousData: true, staleTime: 1000 },
  })

  const { close, open, isOpen } = useDisclosure()

  useEffect(() => {
    const dataFilter = dataUsers?.users.filter(
      item => item.user_id === customerId,
    )
    dataFilter?.length && setUserById(dataFilter[0])
  }, [dataUsers])

  return (
    <div className="relative h-full p-4">
      <div className="mb-5 flex">
        <div className="">
          <Button
            className="rounded-md pr-5"
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
        <div className="ml-5 flex items-center justify-center">
          <p className="text-2xl font-semibold">
            {t('billing:subcription.popup.customer_info')}
          </p>
        </div>
      </div>
      <div className="mb-2 rounded-md bg-gray-50 p-5 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="flex gap-3">
            <p className="text-xl font-semibold">
              {t('billing:customer_manage.info')}
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-3">
          <InputField
            label={t('billing:customer_manage.table.customer_code')}
            value={userById?.customer_code || ''}
            disabled
          />
          <InputField
            label={t('billing:customer_manage.table.customer_name')}
            value={userById?.name || ''}
            disabled
          />
          <InputField
            label={t('billing:customer_manage.table.id_number')}
            value={''}
            disabled
          />
          <InputField
            label={t('billing:customer_manage.table.phone')}
            value={userById?.phone || ''}
            disabled
          />
          <InputField
            label={t('billing:customer_manage.table.email')}
            value={userById?.email || ''}
            disabled
          />
          <InputField
            label={t('billing:customer_manage.table.address')}
            value={userById?.profile?.full_address || ''}
            disabled
          />
          <InputField
            label={t('billing:customer_manage.table.role')}
            value={userById?.role_name || ''}
            disabled
          />
          <InputField
            label={t('billing:customer_manage.table.parent')}
            value={userById?.org_name || ''}
            disabled
          />
        </div>
        <div className="mt-5 flex items-center gap-2">
          <div className="flex gap-3">
            <p className="text-xl font-semibold">
              {t('billing:customer_manage.plan_used')}
            </p>
          </div>
        </div>
        <div className="mt-3 max-h-96 overflow-auto">
          <PlanTable
            data={data?.data?.data}
            offset={offset}
            setOffset={setOffset}
            total={data?.data?.total ?? 0}
            isPreviousData={isPreviousData}
          />
        </div>
      </div>
      <div className="absolute cursor-pointer text-blue-500">
        <div
          onClick={() => {
            open()
            setType('payment')
          }}
          className="mb-2 flex items-center hover:text-blue-300"
        >
          <div className="mr-2 h-1.5 w-1.5 rounded-md bg-blue-500"></div>
          {t('billing:customer_manage.payment_history')}
        </div>
        <div
          onClick={() => {
            open()
            setType('sign')
          }}
          className="flex items-center hover:text-blue-300"
        >
          <div className="mr-2 h-1.5 w-1.5 rounded-md bg-blue-500"></div>
          {t('billing:customer_manage.sign_history')}
        </div>
      </div>

      {isOpen ? (
        <ViewPopup
          type={type}
          id={customerId}
          customerCode={userById?.customer_code}
          customerName={userById?.name}
          close={close}
          isOpen={isOpen}
        />
      ) : null}
    </div>
  )
}
