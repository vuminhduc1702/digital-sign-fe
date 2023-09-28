import { useState } from 'react'
import { type EntityTypeURL, type OrgMapType } from './OrgManageSidebar'
import { Button } from '~/components/Button'
import { Dropdown, MenuItem } from '~/components/Dropdown'
import { Menu } from '@headlessui/react'
import { BtnContextMenuIcon } from '~/components/SVGIcons'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import { useTranslation } from 'react-i18next'
import btnCopyIdIcon from '~/assets/icons/btn-copy_id.svg'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnOpenToggle from '~/assets/icons/btn-open-toggle.svg'
import btnCloseToggle from '~/assets/icons/btn-close-toggle.svg'
import { useNavigate, useParams } from 'react-router-dom'
import { PATHS } from '~/routes/PATHS'
import storage from '~/utils/storage'
import { useDeleteOrg } from '../api/deleteOrg'
import { useCopyId } from '~/utils/hooks'
import clsx from 'clsx'

interface TreeViewProps {
  data: OrgMapType[]
  handleEditTreeView: (data: OrgMapType) => void
}

interface TreeProps {
  data: OrgMapType
  handleEdit: (data: OrgMapType) => void
}

const TreeView = ({ data, handleEditTreeView }: TreeViewProps) => {
  return data.map(item => (
    <Tree
      key={item.id}
      data={item}
      handleEdit={(data: OrgMapType) => handleEditTreeView(data)}
    />
  ))
}

const Tree = ({ data, handleEdit }: TreeProps) => {
  const { t } = useTranslation()
  const [showChildren, setShowChildren] = useState(true)
  const entityTypeURL = window.location.pathname.split('/')[3] as EntityTypeURL
  const navigate = useNavigate()
  const { id: projectId } = storage.getProject()
  const { mutate, isLoading, isSuccess } = useDeleteOrg()
  const handleCopyId = useCopyId()
  const { orgId } = useParams()

  if (!data) return null

  return (
    <ul className="mt-4 pl-6">
      <li>
        <div className="flex items-center" key={data.id}>
          <div
            className="h-5 w-5"
            onClick={() => setShowChildren(!showChildren)}
          >
            {data.children.length ? (
              <img
                src={showChildren ? btnCloseToggle : btnOpenToggle}
                alt="Show child organization"
                className="cursor-pointer"
              />
            ) : (
              ''
            )}
          </div>
          <Button
            className="ml-1 h-10 gap-y-3 rounded-l-md border-none px-4"
            key={data.id}
            variant="muted"
            size="no-p"
            onClick={() => {
              switch (entityTypeURL) {
                case 'org':
                  return navigate(`${PATHS.ORG_MANAGE}/${projectId}/${data.id}`)
                case 'event':
                  return navigate(
                    `${PATHS.EVENT_MANAGE}/${projectId}/${data.id}`,
                  )
                case 'group':
                  return navigate(
                    `${PATHS.GROUP_MANAGE}/${projectId}/${data.id}`,
                  )
                case 'user':
                  return navigate(
                    `${PATHS.USER_MANAGE}/${projectId}/${data.id}`,
                  )
                case 'device':
                  return navigate(
                    `${PATHS.DEVICE_MANAGE}/${projectId}/${data.id}`,
                  )
                default:
                  return navigate(`${PATHS.ORG_MANAGE}/${projectId}/${data.id}`)
              }
            }}
          >
            <p
              className={clsx('my-auto', {
                'text-primary-400': orgId === data.id,
              })}
            >
              {data.name}
            </p>
          </Button>
          <div className="flex items-center justify-center rounded-r-md bg-secondary-600">
            <Dropdown
              menuClass="h-10 w-6"
              icon={
                <BtnContextMenuIcon height={20} width={3} viewBox="0 0 3 20" />
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
                      handleEdit(data)
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
                    onClick={() => handleCopyId(data.id)}
                  >
                    {t('table:copy_id')}
                  </MenuItem>
                  <ConfirmationDialog
                    isDone={isSuccess}
                    icon="danger"
                    title={t('cloud:org_manage.org_map.delete')}
                    body={
                      t('cloud:org_manage.org_map.delete_org_confirm').replace(
                        '{{ORGNAME}}',
                        data.name,
                      ) ?? 'Confirm delete?'
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
                        onClick={() => mutate({ orgId: data.id })}
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
      </li>
      {showChildren &&
        data.children &&
        data.children.map((child: OrgMapType) => {
          return (
            <Tree
              key={child.id}
              data={child}
              handleEdit={(child: OrgMapType) => handleEdit(child)}
            />
          )
        })}
    </ul>
  )
}

export default TreeView
