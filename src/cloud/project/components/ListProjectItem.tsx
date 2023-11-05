import { Link } from '~/components/Link'
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
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Button } from '~/components/Button/Button'
import { useDisclosure } from '~/utils/hooks'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { useTranslation } from 'react-i18next'
import { useDeleteProject } from '../api/deleteProject'
import { UpdateProject } from './UpdateProject'
import { useState } from 'react'
import { API_URL } from '~/config'
import { DownloadIcon } from '@radix-ui/react-icons'
import { backupProject } from '../api/backupProject'

export function ListProjectItem({
  listProjectData,
}: {
  listProjectData: Project[]
}) {
  const { t } = useTranslation()

  const { close, open, isOpen } = useDisclosure()

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

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {listProjectData?.map((project: Project) => {
          return (
            <Link
              to={`${PATHS.ORG_MANAGE}/${project.id}`}
              key={project.id}
              onClick={() => {
                storage.setProject(project)
                setProjectId(project.id)
              }}
            >
              <div
                key={project.id}
                className="relative"
                style={{
                  height: '288px',
                  backgroundSize: '100% 100%',
                  backgroundRepeat: 'no-repeat',
                  backgroundImage: `${
                    project?.image !== ''
                      ? `url(${API_URL}/file/${project?.image})`
                      : `url(${defaultProjectImage})`
                  }`,
                  borderRadius: '10px 10px 10px 0',
                }}
              >
                <div
                  className="absolute right-2 top-2 h-7 w-7 rounded-full bg-secondary-600 bg-opacity-80 hover:bg-primary-400"
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                >
                  <Dropdown
                    icon={
                      <BtnContextMenuIcon
                        height={20}
                        width={10}
                        viewBox="0 0 1 20"
                        className="pt-[3px] text-white"
                      />
                    }
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-6 w-40 origin-top-right divide-y divide-secondary-400 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="p-1">
                        <MenuItem
                          icon={
                            <img
                              src={btnEditIcon}
                              alt="Edit project"
                              className="h-5 w-5"
                            />
                          }
                          onClick={() => {
                            open()
                            setSelectedUpdateProject(project)
                          }}
                        >
                          {t('cloud:project_manager.add_project.edit')}
                        </MenuItem>
                        <MenuItem
                          icon={<DownloadIcon className="h-5 w-5" />}
                          onClick={() => {
                            handleBackupProject(project)
                          }}
                        >
                          {t('cloud:project_manager.backup')}
                        </MenuItem>
                        <ConfirmationDialog
                          isDone={isSuccess}
                          icon="danger"
                          title={t(
                            'cloud:project_manager.add_project.delete_project',
                          )}
                          body={t(
                            'cloud:project_manager.add_project.confirm_delete',
                          ).replace('{{PROJECT}}', project.name)}
                          triggerButton={
                            <Button
                              className="w-full justify-start border-none hover:text-primary-400"
                              variant="trans"
                              size="square"
                              startIcon={
                                <img
                                  src={btnDeleteIcon}
                                  alt="Delete project"
                                  className="h-5 w-5"
                                />
                              }
                            >
                              {t(
                                'cloud:project_manager.add_project.delete_project',
                              )}
                            </Button>
                          }
                          confirmButton={
                            <Button
                              isLoading={isLoading}
                              type="button"
                              size="md"
                              className="rounded-md border bg-primary-400"
                              onClick={() =>
                                mutate({
                                  projectId: project.id,
                                })
                              }
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
                    src={`${
                      project?.image !== ''
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
            </Link>
          )
        })}
      </div>
    </div>
  )
}
