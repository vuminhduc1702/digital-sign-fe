import { PATHS } from '~/routes/PATHS'
import { useProjectIdStore } from '~/stores/project'
import storage from '~/utils/storage'
import defaultProjectImage from '~/assets/images/default-project.png'
import { type Project } from '../routes/ProjectManage'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/Tooltip'
import { BtnContextMenuIcon } from '~/components/SVGIcons'
import { Dropdown, MenuItem } from '~/components/Dropdown'
import { Menu } from '@headlessui/react'

import { Button } from '~/components/Button/Button'
import { useDisclosure } from '~/utils/hooks'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { useTranslation } from 'react-i18next'
import { useDeleteProject } from '../api/deleteProject'
import { UpdateProject } from './UpdateProject'
import { useEffect, useState } from 'react'
import { API_URL } from '~/config'
import { DownloadIcon } from '@radix-ui/react-icons'
import { backupProject } from '../api/backupProject'
import { useNavigate } from 'react-router-dom'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/Dropdowns'
import { ConfirmDialog } from '~/components/ConfirmDialog'

export function ListProjectItem({
  listProjectData,
}: {
  listProjectData: Project[]
}) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [id, setId] = useState('')

  const navigate = useNavigate()

  const { close, open, isOpen } = useDisclosure()
  const {
    close: closeDelete,
    open: openDelete,
    isOpen: isOpenDelete,
  } = useDisclosure()

  const { mutate, isLoading, isSuccess } = useDeleteProject()

  const setProjectId = useProjectIdStore(state => state.setProjectId)

  const [selectedUpdateProject, setSelectedUpdateProject] = useState<Project>()

  async function handleBackupProject(project: Project) {
    const data = await backupProject({ projectId: project.id })
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    const href = await URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = href
    link.download = `${project.name}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    if (isSuccess) {
      closeDelete()
    }
  }, [isSuccess])

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listProjectData?.map((project: Project) => {
        return (
          <div
            key={project.id}
            className="relative cursor-pointer"
            style={{
              height: '288px',
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              backgroundImage: `url(${API_URL}/file/${project?.image}), url(${defaultProjectImage})`,
              borderRadius: '10px 10px 10px 0',
            }}
            onClick={() => {
              storage.setProject(project)
              setProjectId(project.id)
              navigate(`${PATHS.ORG_MANAGE}/${project.id}`)
            }}
          >
            <div
              className="absolute flex justify-center right-2 top-2 h-7 w-7 rounded-full bg-secondary-600 bg-opacity-80 hover:bg-primary-400"
              onClick={e => {
                e.stopPropagation()
              }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div className="flex items-center justify-center rounded-md text-body-sm text-white hover:bg-opacity-30 hover:text-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                    <BtnContextMenuIcon
                      height={20}
                      width={10}
                      viewBox="0 0 1 20"
                      className="pt-[3px] text-white"
                    />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      open()
                      setSelectedUpdateProject(project)
                    }}>
                    <img
                      src={btnEditIcon}
                      alt="Edit project"
                      className="h-5 w-5"
                    />
                    {t('cloud:project_manager.add_project.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      handleBackupProject(project)
                    }}>
                    <DownloadIcon className="h-5 w-5" />
                    {t('cloud:project_manager.backup')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      openDelete()
                      setId(project.id)
                      setName(project.name)
                    }}>
                    <img src={btnDeleteIcon} alt="Delete project" className="size-5" />
                    {t(
                      'cloud:project_manager.add_project.delete_project',
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu >
              {isOpen && selectedUpdateProject?.id === project.id ? (
                <UpdateProject
                  close={close}
                  isOpen={isOpen}
                  selectedUpdateProject={selectedUpdateProject}
                />
              ) : null}
            </div>

            {/* Project card */}
            <div
              className="no-wrap absolute bottom-0 flex items-center gap-x-3 py-3 pl-5"
              style={{
                height: '120px',
                width: '80%',
                backgroundColor: `rgba(85, 86, 87, 0.6)`,
                borderRadius: '0 10px 10px 0',
              }}
            >
              <img
                src={`${project?.image !== ''
                  ? `${API_URL}/file/${project?.image}`
                  : defaultProjectImage
                  }`}
                alt="Project"
                className="aspect-square h-[45px] w-[45px] rounded-full"
                onError={e => {
                  const target = e.target as HTMLImageElement
                  target.onerror = null
                  target.src = defaultProjectImage
                }}
              />
              <div className="space-y-1">
                <p className="text-h2 text-white">{project.name}</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="text-left text-white">
                      {project.description.length > 100
                        ? project.description.slice(0, 100) + '...'
                        : project.description}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{project.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        )
      })}

      {isOpenDelete ? (
        <ConfirmDialog
          icon="danger"
          title={t(
            'cloud:project_manager.add_project.delete_project',
          )}
          body={t(
            'cloud:project_manager.add_project.confirm_delete',
          ).replace('{{PROJECT}}', name)}
          close={closeDelete}
          isOpen={isOpenDelete}
          handleSubmit={() => mutate({
            projectId: id,
          })}
          isLoading={isLoading}
        />
      ) : null}
    </div>
  )
}
