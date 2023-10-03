import { Link } from "~/components/Link";
import { PATHS } from "~/routes/PATHS";
import { useProjectIdStore } from "~/stores/project";
import storage from "~/utils/storage";
import defaultProjectImage from '~/assets/images/default-project.png'
import { Project } from "../routes/ProjectManage";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/Tooltip";
import { BtnContextMenuIcon } from "~/components/SVGIcons";
import { Dropdown, MenuItem } from "~/components/Dropdown";
import { Menu } from "@headlessui/react";
import { ConfirmationDialog } from "~/components/ConfirmationDialog";
import { Button } from "~/components/Button/Button";
import { useDisclosure } from "~/utils/hooks";
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { useTranslation } from "react-i18next";
import { useDeleteProject } from "../api/deleteProject";
import { UpdateProject } from "./UpdateProject";
import { useState } from "react";



export function ListProjectItem({listProjectData}: any) {
  const { t } = useTranslation()
  
  const project = listProjectData;

  const { close, open, isOpen } = useDisclosure()

  const { mutate, isLoading, isSuccess } = useDeleteProject()

  const setProjectId = useProjectIdStore(state => state.setProjectId)

  const [selectedUpdateProject, setSelectedUpdateProject] = useState<Project>({
    id: '',
    name: '',
    image: '',
    description: '',
    app_key: '',
    app_secret: '',
    sms_config: {
      type: '',
      config: {
        code: '',
        password: '',
        service_id: '',
        url: '',
        user: ''
      },
      content: "",
      reset_password_content: ''
    }
  })
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3">
        {
          project?.map((project: Project) => {
            return (
              <div key={project.id} className="relative m-2" style={{height: '288px', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', backgroundImage: `url(${defaultProjectImage})`, borderRadius: '10px 10px 10px 0'}}>
                <div className="absolute top-3 right-3">
                  <Dropdown
                    icon={
                      <BtnContextMenuIcon
                        height={20}
                        width={10}
                        viewBox="0 0 1 20"
                        className="hover:text-primary-400"
                      />
                    }
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-6 w-32 origin-top-right divide-y divide-secondary-400 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-1 py-1">
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
                        <ConfirmationDialog
                          isDone={isSuccess}
                          icon="danger"
                          title={t('cloud:project_manager.add_project.delete_project')}
                          body={
                            t(
                              'cloud:project_manager.add_project.confirm_delete',
                            ).replace('{{PROJECT}}', project.name) ?? 'Confirm delete?'
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
                                  alt="Delete project"
                                  className="h-5 w-5"
                                />
                              }
                            >
                              {t('cloud:project_manager.add_project.delete_project')}
                            </Button>
                          }
                          confirmButton={
                            <Button
                              isLoading={isLoading}
                              type="button"
                              size="md"
                              className="bg-primary-400 rounded-md border"
                              onClick={() =>
                                mutate({
                                  projectId: project.id
                                })
                              }
                              startIcon={
                                <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
                              }
                            />
                          }
                        />
                      </div>
                    </Menu.Items>
                  </Dropdown>
                  { isOpen && selectedUpdateProject.id == project.id ? (
                  <UpdateProject
                    close={close}
                    isOpen={isOpen} 
                    selectedUpdateProject={selectedUpdateProject}                   
                  />
                ) : null}
                </div>

                {/* Project card */}
                < Link
                  to={`${PATHS.ORG_MANAGE}/${project.id}`}
                  key={project.id}
                  onClick={() => {
                    storage.setProject(project)
                    setProjectId(project.id)
                  }}
                >
                  <div className="flex no-wrap gap-x-3 absolute bottom-0 pl-5 py-3 " style={{height: '120px', width: '80%', backgroundColor: `rgba(85, 86, 87, 0.6)`, borderRadius: '0 10px 10px 0'}}>
                    <img
                      src={project?.image || defaultProjectImage}
                      alt="Project"
                      className="aspect-square w-[45px] h-[45px] rounded-full"
                      onError={e => {
                        const target = e.target as HTMLImageElement
                        target.onerror = null
                        target.src = project?.image || defaultProjectImage
                      }}
                    />
                    <div className="space-y-1">
                      <p className="text-h2 text-white">{project.name}</p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="text-white text-left">{project.description.length > 100 ? project.description.slice(0,100) + '...' : project.description}</TooltipTrigger>
                          <TooltipContent>
                            <p>{project.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}