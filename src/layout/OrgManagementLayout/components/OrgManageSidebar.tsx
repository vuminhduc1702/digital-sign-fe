import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import { Menu } from '@headlessui/react'

import { useProjectIdStore } from '~/stores/project'
import { Button } from '~/components/Button'
import { CreateOrg } from './CreateOrg'
import { useOrgIdStore } from '~/stores/org'
import { ComboBoxOrgManageSidebar } from '~/components/ComboBox'
import { Dropdown, MenuItem } from '~/components/Dropdown'
import { useNotificationStore } from '~/stores/notifications'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { useDeleteOrg } from '../api/deleteOrg'
import { UpdateOrg } from './UpdateOrg'
import { useDisclosure } from '~/utils/hooks'

import { SearchIcon, BtnContextMenuIcon } from '~/components/SVGIcons'
import listIcon from '~/assets/icons/list.svg'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnCopyIdIcon from '~/assets/icons/btn-copy_id.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

export type OrgMapType = {
  id: string
  name: string
  level: string
}

function OrgManageSidebar() {
  const { t } = useTranslation()

  const { close, open, isOpen } = useDisclosure()

  const { mutate, isLoading, isSuccess } = useDeleteOrg()

  const [selectedUpdateOrg, setSelectedUpdateOrg] = useState('')
  const [filteredComboboxData, setFilteredComboboxData] = useState<
    OrgMapType[]
  >([])

  const { addNotification } = useNotificationStore()

  const projectName = useProjectIdStore(state => state.projectName)
  const setOrgId = useOrgIdStore(state => state.setOrgId)

  const handleCopy = async (orgId: string) => {
    try {
      await navigator.clipboard.writeText(orgId)
      addNotification({
        type: 'success',
        title: t('cloud.org_manage.org_map.copy_success'),
      })
    } catch (error) {
      console.error(error)
    }
  }

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
            <div className="flex" key={org.id}>
              <Button
                className={clsx(
                  'h-10 gap-y-3 rounded-l-md border-none px-4',
                  // (() => {
                  //   const classes: { [key: string]: boolean } = {}
                  //   for (let i = 1; i <= 99; i++) {
                  //     classes[`ml-${i * 8}`] = org.level === i.toString()
                  //   }
                  //   return classes
                  // })(),
                  {
                    'ml-8': org.level === '1',
                    'ml-16': org.level === '2',
                    'ml-24': org.level === '3',
                    'ml-32': org.level === '4',
                    'ml-40': org.level === '5',
                    'ml-48': org.level === '6',
                    'ml-56': org.level === '7',
                    'ml-64': org.level === '8',
                    'ml-72': org.level === '9',
                    'ml-80': org.level === '10',
                  },
                )}
                key={org.id}
                variant="muted"
                size="no-p"
                onClick={() => setOrgId(org.id)}
              >
                <p className="my-auto">{org.name}</p>
              </Button>
              <div className="flex items-center justify-center rounded-r-md bg-secondary-600">
                <Dropdown
                  menuClass="h-10 w-6"
                  icon={
                    <BtnContextMenuIcon
                      height={20}
                      width={3}
                      viewBox="0 0 3 20"
                    />
                  }
                >
                  <Menu.Items className="absolute left-0 z-10 mt-11 w-32 origin-top-right divide-y divide-secondary-400 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-1 py-1">
                      <MenuItem
                        icon={
                          <img
                            src={btnEditIcon}
                            alt="Edit organization"
                            className="h-5 w-5"
                          />
                        }
                        onClick={() => {
                          open()
                          setSelectedUpdateOrg(org.id)
                        }}
                      >
                        {t('cloud.org_manage.org_map.edit')}
                      </MenuItem>
                      <MenuItem
                        icon={
                          <img
                            src={btnCopyIdIcon}
                            alt="Copy organization's ID"
                            className="h-5 w-5"
                          />
                        }
                        onClick={() => handleCopy(org.id)}
                      >
                        {t('cloud.org_manage.org_map.copy_id')}
                      </MenuItem>
                      <ConfirmationDialog
                        isDone={isSuccess}
                        icon="danger"
                        title={t('cloud.org_manage.org_map.delete')}
                        body={
                          t(
                            'cloud.org_manage.org_map.delete_org_confirm',
                          ).replace('{{ORGNAME}}', org.name) ??
                          'Confirm delete?'
                        }
                        triggerButton={
                          <Button
                            className="w-full border-none hover:opacity-100"
                            style={{ justifyContent: 'flex-start' }}
                            variant="trans"
                            size="square"
                            startIcon={
                              <img
                                src={btnDeleteIcon}
                                alt="Delete organization"
                                className="h-5 w-5"
                              />
                            }
                          >
                            {t('cloud.org_manage.org_map.delete')}
                          </Button>
                        }
                        confirmButton={
                          <Button
                            isLoading={isLoading}
                            type="button"
                            size="md"
                            className="bg-primary-400"
                            onClick={() => mutate({ orgId: org.id })}
                            startIcon={
                              <img
                                src={btnSubmitIcon}
                                alt="Submit"
                                className="h-5 w-5"
                              />
                            }
                          />
                        }
                      />
                    </div>
                  </Menu.Items>
                </Dropdown>
              </div>
            </div>
          ))}
        </div>
        <UpdateOrg
          close={close}
          isOpen={isOpen}
          selectedUpdateOrg={selectedUpdateOrg}
        />
      </div>
    </>
  )
}

export default OrgManageSidebar
