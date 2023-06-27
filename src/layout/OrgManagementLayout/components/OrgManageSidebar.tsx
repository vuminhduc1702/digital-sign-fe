import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import clsx from 'clsx'
import { Menu } from '@headlessui/react'

import { useProjectIdStore } from '~/stores/project'
import { Button } from '~/components/Button'
import { CreateOrg } from './CreateOrg'
import { Dropdown, MenuItem } from '~/components/Dropdown'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { useDeleteOrg } from '../api/deleteOrg'
import { UpdateOrg } from './UpdateOrg'
import { useCopyId, useDisclosure } from '~/utils/hooks'
import { ComboBoxSelectOrg } from '~/layout/MainLayout/components'
import { PATHS } from '~/routes/PATHS'
import { useProjectById } from '~/cloud/project/api'

import { BtnContextMenuIcon } from '~/components/SVGIcons'
import listIcon from '~/assets/icons/list.svg'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnCopyIdIcon from '~/assets/icons/btn-copy_id.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

export type OrgMapType = {
  id: string
  name: string
  level: string
  description: string
  parent_name: string
}

type EntityTypeURL = 'org' | 'group' | 'user' | 'device' | 'event' | 'role'

function OrgManageSidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { close, open, isOpen } = useDisclosure()

  const { orgId } = useParams()

  const projectId = useProjectIdStore(state => state.projectId)
  const { data: projectByIdData } = useProjectById({ projectId })

  const { mutate, isLoading, isSuccess } = useDeleteOrg()

  const [selectedUpdateOrg, setSelectedUpdateOrg] = useState<OrgMapType>({
    id: '',
    name: '',
    level: '1',
    description: '',
    parent_name: '',
  })
  const [filteredComboboxData, setFilteredComboboxData] = useState<
    OrgMapType[]
  >([])

  const handleCopyId = useCopyId()

  const entityTypeURL = window.location.pathname.split('/')[3] as EntityTypeURL
  const orgIdURL = window.location.pathname.split('/')[5]

  return (
    <>
      <div className="flex h-[60px] items-center gap-2 bg-secondary-400 px-4 py-3">
        <div className="flex gap-3">
          <img
            src={listIcon}
            alt="Organization list"
            className="aspect-square w-[20px]"
          />
          <p>{t('cloud:org_manage.org_list')}</p>
        </div>
        <CreateOrg />
        <ComboBoxSelectOrg setFilteredComboboxData={setFilteredComboboxData} />
      </div>
      <div className="grow overflow-y-auto bg-secondary-500 p-3">
        <div className="space-y-3">
          <Button
            className={clsx('rounded-md border-none', {
              'text-primary-400': orgIdURL == null,
            })}
            variant="muted"
            onClick={() => {
              switch (entityTypeURL) {
                case 'org':
                  return navigate(`${PATHS.ORG_MANAGE}/${projectId}`)
                case 'event':
                  return navigate(`${PATHS.EVENT_MANAGE}/${projectId}`)
                case 'group':
                  return navigate(`${PATHS.GROUP_MANAGE}/${projectId}`)
                case 'user':
                  return navigate(`${PATHS.USER_MANAGE}/${projectId}`)
                case 'device':
                  return navigate(`${PATHS.DEVICE_MANAGE}/${projectId}`)
                default:
                  return navigate(`${PATHS.ORG_MANAGE}/${projectId}`)
              }
            }}
          >
            {projectByIdData?.name}
          </Button>
          {filteredComboboxData?.map((org: OrgMapType) => (
            <div className="flex" key={org.id}>
              <Button
                className={clsx(
                  'h-10 gap-y-3 rounded-l-md border-none px-4',
                  // FIXME: Somehow this IIFE function doesn't run right away
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
                onClick={() => {
                  switch (entityTypeURL) {
                    case 'org':
                      return navigate(
                        `${PATHS.ORG_MANAGE}/${projectId}/${org.id}`,
                      )
                    case 'event':
                      return navigate(
                        `${PATHS.EVENT_MANAGE}/${projectId}/${org.id}`,
                      )
                    case 'group':
                      return navigate(
                        `${PATHS.GROUP_MANAGE}/${projectId}/${org.id}`,
                      )
                    case 'user':
                      return navigate(
                        `${PATHS.USER_MANAGE}/${projectId}/${org.id}`,
                      )
                    case 'device':
                      return navigate(
                        `${PATHS.DEVICE_MANAGE}/${projectId}/${org.id}`,
                      )
                    default:
                      return navigate(
                        `${PATHS.ORG_MANAGE}/${projectId}/${org.id}`,
                      )
                  }
                }}
              >
                <p
                  className={clsx('my-auto', {
                    'text-primary-400': orgId === org.id,
                  })}
                >
                  {org.name}
                </p>
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
                          setSelectedUpdateOrg(org)
                        }}
                      >
                        {t('cloud:org_manage.org_map.edit')}
                      </MenuItem>
                      <MenuItem
                        icon={
                          <img
                            src={btnCopyIdIcon}
                            alt="Copy organization's ID"
                            className="h-5 w-5"
                          />
                        }
                        onClick={() => handleCopyId(org.id)}
                      >
                        {t('table:copy_id')}
                      </MenuItem>
                      <ConfirmationDialog
                        isDone={isSuccess}
                        icon="danger"
                        title={t('cloud:org_manage.org_map.delete')}
                        body={
                          t(
                            'cloud:org_manage.org_map.delete_org_confirm',
                          ).replace('{{ORGNAME}}', org.name) ??
                          'Confirm delete?'
                        }
                        triggerButton={
                          <Button
                            className="w-full border-none hover:text-primary-400"
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
                            {t('cloud:org_manage.org_map.delete')}
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
