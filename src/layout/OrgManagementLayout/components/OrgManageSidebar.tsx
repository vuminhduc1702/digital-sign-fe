import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

import { useProjectIdStore } from '~/stores/project'
import { Button } from '~/components/Button'
import { CreateOrg } from './CreateOrg'
import { useOrgIdStore } from '~/stores/org'
import { ComboBoxOrgManageSidebar } from '~/components/ComboBox'

import { SearchIcon, BtnContextMenuIcon } from '~/components/SVGIcons'
import listIcon from '~/assets/icons/list.svg'

export type OrgMapType = {
  id: string
  name: string
  level: string
}

function OrgManageSidebar() {
  const { t } = useTranslation()

  const [filteredComboboxData, setFilteredComboboxData] = useState<
    OrgMapType[]
  >([])

  const projectName = useProjectIdStore(state => state.projectName)
  const setOrgId = useOrgIdStore(state => state.setOrgId)

  return (
    <>
      <div className="flex h-[60px] items-center gap-2 bg-secondary-400 px-4 py-3">
        <div className="flex gap-3">
          <img
            src={listIcon}
            alt="Organization list"
            className="aspect-square w-[20px]"
          />
          <p>{t('cloud.org_manage.org_list')}</p>
        </div>
        <CreateOrg />
        <ComboBoxOrgManageSidebar
          setFilteredComboboxData={setFilteredComboboxData}
          startIcon={<SearchIcon width={16} height={16} viewBox="0 0 16 16" />}
        />
      </div>
      <div className="overflow-y-scroll bg-secondary-500 p-3">
        <div className="space-y-3">
          <Button className="rounded-md border-none" variant="muted">
            {projectName}
          </Button>
          {filteredComboboxData?.map((org: OrgMapType) => (
            <Button
              className={clsx(
                'h-10 gap-y-3 rounded-md border-none pl-4',
                (() => {
                  const classes: { [key: string]: boolean } = {}
                  for (let i = 1; i <= 99; i++) {
                    classes[`ml-${i * 8}`] = org.level === i.toString()
                  }
                  return classes
                })(),
              )}
              key={org.id}
              variant="muted"
              size="no-p"
              onClick={() => setOrgId(org.id)}
              endIcon={
                <div className="group flex h-10 w-6 items-center justify-center rounded-r-md bg-secondary-600">
                  <BtnContextMenuIcon
                    className="cursor-pointer text-white group-hover:text-primary-400"
                    height={20}
                    width={3}
                    viewBox="0 0 3 20"
                  />
                </div>
              }
            >
              <p className="my-auto">{org.name}</p>
            </Button>
          ))}
        </div>
      </div>
    </>
  )
}

export default OrgManageSidebar
