import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import clsx from 'clsx'
import { Menu } from '@headlessui/react'

import { useProjectIdStore } from '~/stores/project'
import { Button } from '~/components/Button'
import { Dropdown, MenuItem } from '~/components/Dropdown'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { useDisclosure } from '~/utils/hooks'
import { useCopyId } from '~/utils/misc'
import { PATHS } from '~/routes/PATHS'
import { useDeleteRole } from '../api'
import { ComboBoxSelectRole } from './ComboBoxSelectRole'
import CreateRole from './CreateRole'

import { type Role } from '../types'

import { BtnContextMenuIcon } from '~/components/SVGIcons'
import listIcon from '~/assets/icons/list.svg'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnCopyIdIcon from '~/assets/icons/btn-copy_id.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'

export function RoleSidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { close, open, isOpen } = useDisclosure()

  const { roleId } = useParams()

  const projectId = useProjectIdStore(state => state.projectId)

  const { mutate, isLoading, isSuccess } = useDeleteRole()

  const [selectedUpdateRole, setSelectedUpdateRole] = useState<Role>()
  const [filteredComboboxData, setFilteredComboboxData] = useState<Role[]>([])

  const handleCopyId = useCopyId()

  return (
    <>
      <div className="flex h-[60px] items-center gap-2 bg-secondary-400 px-4 py-3">
        <div className="flex gap-3">
          <img
            src={listIcon}
            alt="Role list"
            className="aspect-square w-[20px]"
          />
          <p>{t('cloud.role_manage.sidebar.title')}</p>
        </div>
        <CreateRole />
        <ComboBoxSelectRole setFilteredComboboxData={setFilteredComboboxData} />
      </div>
      <div className="grow overflow-y-auto bg-secondary-500 p-3">
        {filteredComboboxData?.length > 0 ? (
          <div className="space-y-3">
            {filteredComboboxData?.map((role: Role) => (
              <div className="flex" key={role.id}>
                <Button
                  className={clsx('gap-y-3 rounded-l-md border-none px-4')}
                  key={role.id}
                  variant="muted"
                  size="no-p"
                  onClick={() =>
                    navigate(`${PATHS.ROLE_MANAGE}/${projectId}/${role.id}`)
                  }
                >
                  <p
                    className={clsx('my-auto', {
                      'text-primary-400': roleId === role.id,
                    })}
                  >
                    {role.name}
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
                              alt="Edit role"
                              className="h-5 w-5"
                            />
                          }
                          onClick={() => {
                            open()
                            setSelectedUpdateRole(role)
                          }}
                        >
                          {t('cloud.role_manage.sidebar.edit')}
                        </MenuItem>
                        <MenuItem
                          icon={
                            <img
                              src={btnCopyIdIcon}
                              alt="Copy role's ID"
                              className="h-5 w-5"
                            />
                          }
                          onClick={() => handleCopyId(role.id)}
                        >
                          {t('table.copy_id')}
                        </MenuItem>
                        <ConfirmationDialog
                          isDone={isSuccess}
                          icon="danger"
                          title={t('cloud.role_manage.sidebar.delete_role')}
                          body={
                            t(
                              'cloud.role_manage.sidebar.delete_role_confirm',
                            ).replace('{{ROLENAME}}', role.name) ??
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
                                  alt="Delete role"
                                  className="h-5 w-5"
                                />
                              }
                            >
                              {t('cloud.role_manage.sidebar.delete_role')}
                            </Button>
                          }
                          confirmButton={
                            <Button
                              isLoading={isLoading}
                              type="button"
                              size="md"
                              className="bg-primary-400"
                              onClick={() => mutate({ id: role.id })}
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
        ) : (
          <div className="flex h-full items-center justify-center">
            {t('cloud.role_manage.sidebar.no_role')}
          </div>
        )}
        {/* {selectedUpdateRole != null ? (
          <UpdateRole
            close={close}
            isOpen={isOpen}
            selectedUpdateRole={selectedUpdateRole}
          />
        ) : null} */}
      </div>
    </>
  )
}
