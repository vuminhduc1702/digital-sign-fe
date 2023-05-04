import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  CreateAttr,
  AttrTable,
  ComboBoxSelectAttr,
} from '~/cloud/orgManagement/components/Attributes'
import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { useOrgById } from '~/layout/OrgManagementLayout/api'

import { type Attribute } from '~/types'

import defaultOrgImage from '~/assets/images/default-org.png'

export function OrgManage() {
  const { t } = useTranslation()

  const params = useParams()
  const orgId = params.orgId as string
  const { data: orgByIdData } = useOrgById({ orgId })

  const [filteredComboboxData, setFilteredComboboxData] = useState<Attribute[]>(
    [],
  )

  return (
    <div className="flex grow flex-col gap-y-3">
      <div>
        <TitleBar
          title={t('cloud.org_manage.org_manage.overview.title') ?? 'Overview'}
        />
        <div className="flex gap-6 px-11 py-3 shadow-lg">
          <div className="flex flex-none items-center">
            <img
              src={orgByIdData?.image || defaultOrgImage}
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
            <p>{t('cloud.org_manage.org_manage.overview.name')}</p>
            <p>{t('cloud.org_manage.org_manage.overview.desc')}</p>
          </div>
          <div className="flex flex-col gap-4">
            <p>{orgByIdData?.name}</p>
            <p>{orgByIdData?.description}</p>
          </div>
        </div>
      </div>
      <div className="flex grow flex-col">
        <TitleBar
          title={
            t('cloud.org_manage.org_manage.attr_list') ?? "Attribute's list"
          }
        />
        <div className="flex grow flex-col px-9 py-3 shadow-lg">
          <div className="flex justify-between">
            <ExportTable />
            <div className="flex items-center gap-x-3">
              <CreateAttr entityId={orgId} entityType="ORGANIZATION" />
              <ComboBoxSelectAttr
                setFilteredComboboxData={setFilteredComboboxData}
              />
            </div>
          </div>
          <AttrTable
            data={filteredComboboxData}
            entityId={orgId}
            entityType="ORGANIZATION"
          />
        </div>
      </div>
    </div>
  )
}
