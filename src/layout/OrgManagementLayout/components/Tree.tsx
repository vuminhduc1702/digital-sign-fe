import { useEffect, useState } from 'react'
import { type EntityTypeURL, type OrgMapType } from './OrgManageSidebar'
import { Button } from '@/components/ui/button'

import { BtnContextMenuIcon } from '@/components/SVGIcons'
import btnEditIcon from '@/assets/icons/btn-edit.svg'
import { useTranslation } from 'react-i18next'
import btnCopyIdIcon from '@/assets/icons/btn-copy_id.svg'

import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import btnOpenToggle from '@/assets/icons/btn-open-toggle.svg'
import btnCloseToggle from '@/assets/icons/btn-close-toggle.svg'
import { useNavigate, useParams } from 'react-router-dom'
import { PATHS } from '@/routes/PATHS'
import storage from '@/utils/storage'
import { useDeleteOrg } from '../api/deleteOrg'
import { useCopyId, useDisclosure } from '@/utils/hooks'
import clsx from 'clsx'
import { cn } from '@/utils/misc'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/ConfirmDialog'

interface TreeViewProps {
  data: OrgMapType[]
  handleEditTreeView: (data: OrgMapType) => void
  isShow: boolean
}
interface TreeProps {
  data: OrgMapType
  handleEdit: (data: OrgMapType) => void
  isShow: boolean
}

const TreeView = ({ data, handleEditTreeView, isShow }: TreeViewProps) => {
  const dataSorted = data?.sort((a, b) =>
    a.name > b.name ? 1 : b.name > a.name ? -1 : 0,
  )
  return dataSorted?.map(item => (
    <Tree
      key={item.id}
      data={item}
      handleEdit={(data: OrgMapType) => handleEditTreeView(data)}
      isShow={isShow}
    />
  ))
}
const Tree = ({ data, handleEdit, isShow }: TreeProps) => {
  const { t } = useTranslation()
  const [showChildren, setShowChildren] = useState(false)
  const entityTypeURL = window.location.pathname.split('/')[3] as EntityTypeURL
  const navigate = useNavigate()
  const projectId = storage.getProject()?.id
  const { mutate, isLoading, isSuccess } = useDeleteOrg()
  const handleCopyId = useCopyId()
  const { orgId } = useParams()

  const {
    close: closeDelete,
    open: openDelete,
    isOpen: isOpenDelete,
  } = useDisclosure()

  useEffect(() => {
    if (isSuccess) {
      closeDelete()
    }
  }, [isSuccess])

  const handleClick = () => {
    setShowChildren(!showChildren)
  }

  useEffect(() => {
    if (isShow) {
      setShowChildren(isShow)
    } else {
      setShowChildren(data?.isShow)
    }
  }, [data?.isShow, isShow])

  if (!data) return null
  const dataSorted = data.children.sort((a, b) =>
    a.name > b.name ? 1 : b.name > a.name ? -1 : 0,
  )
  return (
    <ul className="mt-4 pl-6">
      <li>
        <div className="flex items-center">
          <div className="h-5 w-5" onClick={handleClick}>
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
            className={cn(
              'ml-1 h-10 gap-y-3 rounded-l-md border-none px-4 py-0',
              {
                '!bg-primary-300': data.isSearch,
              },
            )}
            key={data.id}
            variant="muted"
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
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="flex h-10 w-6 items-center justify-center rounded-md text-body-sm text-white hover:bg-opacity-30 hover:text-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                  <BtnContextMenuIcon
                    height={20}
                    width={3}
                    viewBox="0 0 3 20"
                  />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-10">
                <DropdownMenuItem
                  onClick={() => {
                    handleEdit(data)
                  }}
                >
                  <img
                    src={btnEditIcon}
                    alt="Edit organization"
                    className="h-5 w-5"
                  />
                  {t('cloud:org_manage.org_map.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCopyId(data.id)}>
                  <img
                    src={btnCopyIdIcon}
                    alt="Copy organization's ID"
                    className="h-5 w-5"
                  />
                  {t('table:copy_id')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openDelete}>
                  <img
                    src={btnDeleteIcon}
                    alt="Delete organization"
                    className="h-5 w-5"
                  />
                  {t('cloud:org_manage.org_map.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </li>
      {showChildren &&
        data.children &&
        dataSorted.map((child: OrgMapType) => {
          return (
            <Tree
              isShow={isShow}
              key={child.id}
              data={child}
              handleEdit={(child: OrgMapType) => handleEdit(child)}
            />
          )
        })}

      {isOpenDelete ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:org_manage.org_map.delete')}
          body={t('cloud:org_manage.org_map.delete_org_confirm').replace(
            '{{ORGNAME}}',
            data.name,
          )}
          close={closeDelete}
          isOpen={isOpenDelete}
          isSuccessDelete={isSuccess}
          handleSubmit={() => mutate({ orgId: data.id })}
          isLoading={isLoading}
        />
      ) : null}
    </ul>
  )
}

export default TreeView
