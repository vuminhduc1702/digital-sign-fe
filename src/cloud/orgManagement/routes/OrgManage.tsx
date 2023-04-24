import { useTranslation } from 'react-i18next'
import { useState } from 'react'

import { useOrgIdStore } from '~/stores/org'
import {
  CreateAttr,
  AttrTable,
  ComboBoxAttrTable,
} from '~/cloud/orgManagement/components/Attributes'
import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { useOrgById } from '~/layout/OrgManagementLayout/api/getOrgById'

import { type PropertyValuePair } from '~/utils/misc'

import defaultOrgImage from '~/assets/images/default-org.png'
import { SearchIcon } from '~/components/SVGIcons'

function OrgManage() {
  const { t } = useTranslation()

  const orgId = useOrgIdStore(state => state.orgId)
  const { data: orgByIdData } = useOrgById({ orgId })

  const [filteredComboboxData, setFilteredComboboxData] = useState<
    PropertyValuePair<string>[]
  >([])

  return (
    <div className="flex grow flex-col gap-y-3">
      <div className="space-y-3">
        <TitleBar title={t('cloud.org_manage.org_manage.overview.title')} />
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
      {orgId ? (
        <div className="flex grow flex-col gap-y-3">
          <TitleBar title={t('cloud.org_manage.org_manage.attr_list')} />
          <div className="flex grow flex-col px-9 py-4 shadow-lg">
            <div className="flex justify-between">
              <ExportTable />
              <div className="flex items-center gap-x-3">
                <CreateAttr entityId={orgId} entityType="ORGANIZATION" />
                <ComboBoxAttrTable
                  setFilteredComboboxData={setFilteredComboboxData}
                  startIcon={
                    <SearchIcon width={16} height={16} viewBox="0 0 16 16" />
                  }
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
      ) : null}
    </div>
  )
}

export default OrgManage
