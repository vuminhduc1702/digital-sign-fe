import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import TitleBar from '~/components/Head/TitleBar'
import storage from '~/utils/storage'
import { useGetAdapters } from '../api/adapter'
import {
  AdapterTable,
  ComboBoxSelectAdapter,
  CreateAdapter,
} from '../components'
import { ContentLayout } from '~/layout/ContentLayout'

import { type Adapter } from '../types'

export function CustomProtocolManage() {
  const { t } = useTranslation()

  const [filteredComboboxData, setFilteredComboboxData] = useState<Adapter[]>(
    [],
  )
  const [offset, setOffset] = useState(0)

  const { id: projectId } = storage.getProject()
  const {
    data: adapterData,
    isPreviousData,
    isSuccess,
  } = useGetAdapters({
    projectId,
    offset,
    config: { keepPreviousData: true },
  })

  return (
    <ContentLayout title={t('cloud:custom_protocol.title')}>
      <TitleBar title={t('cloud:custom_protocol.adapter.header')} />
      <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-end">
          <div className="flex items-center gap-x-3">
            <CreateAdapter />
            {isSuccess ? (
              <ComboBoxSelectAdapter
                data={adapterData}
                setFilteredComboboxData={setFilteredComboboxData}
                offset={offset}
              />
            ) : null}
          </div>
        </div>
        <AdapterTable
          data={filteredComboboxData}
          offset={offset}
          setOffset={setOffset}
          total={adapterData?.total ?? 0}
          isPreviousData={isPreviousData}
        />
      </div>
    </ContentLayout>
  )
}
