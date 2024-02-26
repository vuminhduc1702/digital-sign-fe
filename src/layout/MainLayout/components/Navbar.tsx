import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useTranslation } from 'react-i18next'

import { useSpinDelay } from 'spin-delay'
import { useUserInfo } from '~/cloud/orgManagement/api/userAPI'
import { useProjects } from '~/cloud/project/api'
import { Link } from '~/components/Link'
import { Spinner } from '~/components/Spinner'
import { API_URL } from '~/config'
import { useLogout, useUser } from '~/lib/auth'
import { PATHS } from '~/routes/PATHS'
import { useProjectIdStore } from '~/stores/project'
import { useCopyId } from '~/utils/hooks'
import storage from '~/utils/storage'
import i18n from '~/i18n'

import { type Project } from '~/cloud/project/routes/ProjectManage'

import defaultUserIcon from '~/assets/icons/default-user.svg'
import caidatIcon from '~/assets/icons/nav-caidat.svg'
import hotroIcon from '~/assets/icons/nav-hotro.svg'
import manualIcon from '~/assets/icons/nav-manual.svg'
import qldaIcon from '~/assets/icons/nav-qlda.svg'
import defaultProjectImage from '~/assets/images/default-project.png'
import { SidebarDropDownIcon } from '~/components/SVGIcons'
import { LuLanguages } from 'react-icons/lu'
import English from '~/assets/images/landingpage/uk-flag.png'
import VietNam from '~/assets/images/landingpage/vietnam-flag.png'

function Navbar() {
  const { t } = useTranslation()
  const { data: projectsData } = useProjects()

  const { data: userInfoData, isLoading: userInfoIsLoading } = useUserInfo({
    config: {
      suspense: false,
    },
  })
  const { data: userData } = useUser()

  const setProjectId = useProjectIdStore(state => state.setProjectId)

  const logout = useLogout()

  const handleCopyId = useCopyId()

  const showSpinner = useSpinDelay(userInfoIsLoading, {
    delay: 150,
    minDuration: 300,
  })

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language)
  }

  const languages = [
    { code: 'vi', name: `Tiếng Việt`, icon: VietNam },
    { code: 'en', name: `English`, icon: English },
  ]

  return (
    <div className="flex w-full">
      <nav className="flex h-20 w-full justify-end gap-x-5 bg-secondary-900 pr-5 lg:gap-x-10">
        <a
          className="flex cursor-pointer items-center gap-x-2"
          target="_blank"
          href="https://innoway.gitbook.io/innoway/"
          rel="noreferrer"
        >
          <img
            src={manualIcon}
            alt="Manual"
            className="aspect-square w-[20px]"
          />
          <p className="text-white">{t('nav:manual')}</p>
        </a>

        <DropdownMenu.Root>
          <div className="flex items-center gap-x-2">
            <img
              src={qldaIcon}
              alt="Project management"
              className="aspect-square w-[20px]"
            />
            <p className="text-white">
              <Link className="flex w-full" to={PATHS.PROJECT_MANAGE}>
                {t('nav:qlda')}
              </Link>
            </p>
            <DropdownMenu.Trigger asChild className="flex items-center gap-x-2">
              <div className="cursor-pointer">
                <SidebarDropDownIcon
                  width={12}
                  height={7}
                  viewBox="0 0 12 7"
                  className="text-white"
                />
              </div>
            </DropdownMenu.Trigger>
          </div>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="flex max-h-[360px] w-[260px] min-w-[220px] flex-col gap-y-3 overflow-y-auto rounded-md bg-white p-3 shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade"
              sideOffset={20}
            >
              {projectsData?.projects.map((project: Project) => {
                return (
                  <Link
                    to={`${PATHS.ORG_MANAGE}/${project.id}`}
                    key={project.id}
                  >
                    <DropdownMenu.Item
                      className="group relative flex cursor-pointer select-none items-center gap-x-3 px-1 pl-6 leading-none outline-none"
                      onClick={() => {
                        storage.setProject(project)
                        setProjectId(project.id)
                      }}
                    >
                      <img
                        src={`${
                          project?.image !== ''
                            ? `${API_URL}/file/${project?.image}`
                            : defaultProjectImage
                        }`}
                        alt="Project"
                        className="aspect-square w-[45px] rounded-full"
                        onError={e => {
                          const target = e.target as HTMLImageElement
                          target.onerror = null
                          target.src = defaultProjectImage
                        }}
                      />
                      <div className="space-y-1">
                        <p className="text-h2">{project.name}</p>
                        <p>{project.description}</p>
                      </div>
                    </DropdownMenu.Item>
                  </Link>
                )
              })}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* <div className="flex cursor-pointer items-center gap-x-2">
          <img
            src={caidatIcon}
            alt="Setting"
            className="aspect-square w-[20px]"
          />
          <p className="text-white">{t('nav:setup')}</p>
        </div>
        <div className="flex cursor-pointer items-center gap-x-2">
          <img
            src={hotroIcon}
            alt="Support"
            className="aspect-square w-[20px]"
          />
          <p className="text-white">{t('nav:support')}</p>
        </div> */}

        {userInfoIsLoading ? (
          <div className="flex items-center justify-center">
            <Spinner
              showSpinner={showSpinner}
              size="md"
              className="text-white"
            />
          </div>
        ) : (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild className="flex items-center gap-x-2">
              <div className="cursor-pointer">
                <img
                  src={defaultUserIcon}
                  alt="User's avatar"
                  className="aspect-square w-[20px]"
                />
                <p className="text-white">
                  {t('nav:hello')}{' '}
                  {userInfoData != null
                    ? userInfoData?.name || userInfoData?.email?.split('@')[0]
                    : t('nav:friend')}
                </p>
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
                className="flex max-h-[360px] w-[220px] flex-col gap-y-3 overflow-y-auto rounded-md bg-white p-3 shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade"
                sideOffset={-15}
              >
                <DropdownMenu.Item className="rounded-md p-2 hover:bg-primary-300 hover:bg-opacity-25 focus-visible:border-none focus-visible:outline-none">
                  {userData ? (
                    <p
                      className="cursor-pointer"
                      onClick={() => handleCopyId(userData.device_token)}
                    >
                      {t('user:copy_device_token')}
                    </p>
                  ) : null}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  asChild
                  className="rounded-md p-2 hover:bg-primary-300 hover:bg-opacity-25 focus-visible:border-none focus-visible:outline-none"
                >
                  <Link to={PATHS.USER_INFO}>
                    {t('cloud:custom_protocol.adapter.username')}
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  asChild
                  className="rounded-md p-2 hover:bg-primary-300 hover:bg-opacity-25 focus-visible:border-none focus-visible:outline-none"
                >
                  <Link to={PATHS.TENANT_MANAGE}>Tenant</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  asChild
                  className="rounded-md p-2 hover:bg-primary-300 hover:bg-opacity-25 focus-visible:border-none focus-visible:outline-none"
                >
                  <Link to={PATHS.DEV_ROLE}>{t('dev_role:title')}</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  asChild
                  className="rounded-md p-2 hover:bg-primary-300 hover:bg-opacity-25 focus-visible:border-none focus-visible:outline-none"
                >
                  <Link to={PATHS.CHANGEPASSWORD}>
                    {t('user:change_password')}
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="rounded-md p-2 hover:bg-primary-300 hover:bg-opacity-25 focus-visible:border-none focus-visible:outline-none">
                  <p
                    className="cursor-pointer"
                    onClick={() => logout.mutate({})}
                  >
                    {t('user:logout')}
                  </p>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild className="flex items-center gap-x-2">
            <div className="cursor-pointer">
              {languages.find(language => i18n.language === language.code)
                ?.icon != null ? (
                <img
                  src={
                    languages.find(language => i18n.language === language.code)
                      ?.icon
                  }
                  alt="flag"
                  className="h-auto w-8"
                />
              ) : (
                <LuLanguages className="text-white" />
              )}
              <p className="text-white">
                {languages.find(language => i18n.language === language.code)
                  ?.name ?? t('nav:choose_lang')}
              </p>
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
              className="flex max-h-[360px] min-w-[160px] flex-col gap-y-3 overflow-y-auto rounded-md bg-white p-3 shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade"
              sideOffset={-15}
            >
              {languages.map(language => (
                <DropdownMenu.Item
                  key={language.code}
                  className="group relative flex cursor-pointer select-none items-center gap-x-3 px-1 leading-none outline-none"
                  onClick={() => changeLanguage(language.code)}
                >
                  <img src={language.icon} alt="" className="h-auto w-8" />
                  <div>{language.name}</div>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </nav>
    </div>
  )
}

export default Navbar
