import { useTranslation } from 'react-i18next'
import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  CreateAttr,
  AttrTable,
} from '~/cloud/orgManagement/components/Attributes'
import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { useOrgById } from '~/layout/OrgManagementLayout/api'
import { lazyImport } from '~/utils/lazyImport'
import { API_URL } from '~/config'

import { type Attribute } from '~/types'

import defaultOrgImage from '~/assets/images/default-org.png'
import { InputField } from '~/components/Form'

const { OrgMap } = lazyImport(() => import('./OrgMap'), 'OrgMap')

export function OrgManage() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const params = useParams()
  const orgId = params.orgId as string
  const entityType = 'ORGANIZATION'

  const [searchQuery, setSearchQuery] = useState('')
  const [data, setData] = useState<Attribute[]>([])
  const { data: orgByIdData } = useOrgById({ orgId })

  const [filteredComboboxData, setFilteredComboboxData] = useState<Attribute[]>(
    [],
  )

  return (
    <>
      {orgId ? (
        <div ref={ref} className="flex grow flex-col gap-y-3">
          <div>
            <TitleBar title={t('cloud:org_manage.org_manage.overview.title')} />
            <div className="flex gap-6 px-11 py-3 shadow-lg">
              <div className="flex flex-none items-center">
                <img
                  src={`${
                    orgByIdData?.image
                      ? `${API_URL}/file/${orgByIdData?.image}`
                      : defaultOrgImage
                  }`}
                  onError={e => {
                    const target = e.target as HTMLImageElement
                    target.onerror = null
                    target.src = defaultOrgImage
                  }}
                  alt="Organization"
                  className="h-36 w-32"
                />
              </div>
              <div className="flex flex-col gap-4">
                <p>{t('cloud:org_manage.org_manage.overview.name')}</p>
                <p>{t('cloud:org_manage.org_manage.overview.desc')}</p>
              </div>
              <div className="flex flex-col gap-4">
                <p>{orgByIdData?.name}</p>
                <p>{orgByIdData?.description}</p>
              </div>
            </div>
          </div>
          <div className="flex grow flex-col">
            <TitleBar title={t('cloud:org_manage.org_manage.attr_list')} />
            <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
              <div className="flex justify-between">
                <ExportTable refComponent={ref} />
                <div className="flex items-center gap-x-3">
                  <CreateAttr entityId={orgId} entityType="ORGANIZATION" />
                  {/* <ComboBoxSelectAttr
                    entityId={orgId}
                    entityType="ORGANIZATION"
                    setFilteredComboboxData={setFilteredComboboxData}
                  /> */}
                  {/* dummyInput */}
                  <InputField
                    type="text"
                    placeholder="Search"
                    onChange={e => {
                      const value = e.target.value
                      setSearchQuery(value)
                    }}
                  />
                </div>
              </div>
              <AttrTable
                entityId={orgId}
                entityType={entityType}
                searchQuery={searchQuery}
              />
            </div>
          </div>
        </div>
      ) : (
        <OrgMap />
      )}
    </>
  )
}
