import { useTranslation } from 'react-i18next'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

import { useProjects } from '../api/getProjects'
import { useUser } from '~/lib/auth'
import { Link } from '~/components/Link'
import { PATHS } from '~/routes/PATHS'
import { useProjectIdStore } from '~/stores/project'

import { type Project } from '../types'

import { SidebarDropDownIcon } from '~/components/SVGIcons'
import caidatIcon from '~/assets/icons/nav-caidat.svg'
import qldaIcon from '~/assets/icons/nav-qlda.svg'
import hotroIcon from '~/assets/icons/nav-hotro.svg'
import defaultUserIcon from '~/assets/icons/default-user.svg'
import defaultProjectImage from '~/assets/images/default-project.png'

function Navbar() {
  const { t } = useTranslation()
  const { data: projectsData } = useProjects()
  const { data: userData } = useUser()

  const projectId = useProjectIdStore(state => state.projectId)
  const setProjectId = useProjectIdStore(state => state.setProjectId)

  return (
    <nav className="fixed top-0 flex h-[9vh] w-full justify-end gap-x-5 bg-secondary-900 pr-5 pl-[50px] sm:pl-0 lg:gap-x-10 lg:pl-[254px]">
      <div className="flex cursor-pointer items-center gap-x-2">
        <img
          src={defaultUserIcon}
          alt="User's avatar"
          className="aspect-square w-[20px]"
        />
        <p className="text-white">
          {t('nav.hello')} {userData?.name || userData?.email?.split('@')[0]}
        </p>
      </div>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild className="flex items-center gap-x-2">
          <div className="cursor-pointer">
            <img
              src={qldaIcon}
              alt="Project management"
              className="aspect-square w-[20px]"
            />
            <p className="text-white">{t('nav.qlda')}</p>
            <SidebarDropDownIcon
              width={12}
              height={7}
              viewBox="0 0 12 7"
              className="text-white"
            />
          </div>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="flex max-h-[360px] w-[260px] min-w-[220px] flex-col gap-y-3 overflow-y-auto rounded-md bg-white p-1 shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
            sideOffset={5}
          >
            {projectsData?.projects.map((project: Project) => {
              return (
                <Link
                  to={PATHS.ORG_INFO.replace(':projectId', projectId)}
                  key={project.id}
                >
                  <DropdownMenu.Item
                    className="group relative flex cursor-pointer select-none items-center gap-x-3 px-1 pl-6 leading-none outline-none"
                    onClick={() => setProjectId(project.id, project.name)}
                  >
                    <img
                      src={project?.image || defaultProjectImage}
                      alt="Project"
                      className="aspect-square w-[45px] rounded-full"
                      onError={e => {
                        const target = e.target as HTMLImageElement
                        target.onerror = null
                        target.src = defaultProjectImage
                      }}
                    />
                    <div className="space-y-1">
                      <p>{project.name}</p>
                      <p>{project.description}</p>
                    </div>
                  </DropdownMenu.Item>
                </Link>
              )
            })}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <div className="flex cursor-pointer items-center gap-x-2">
        <img
          src={caidatIcon}
          alt="Setting"
          className="aspect-square w-[20px]"
        />
        <p className="text-white">{t('nav.setup')}</p>
      </div>
      <div className="flex cursor-pointer items-center gap-x-2">
        <img src={hotroIcon} alt="Support" className="aspect-square w-[20px]" />
        <p className="text-white">{t('nav.support')}</p>
      </div>
    </nav>
  )
}

export default Navbar
