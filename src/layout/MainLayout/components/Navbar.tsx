import { useTranslation } from 'react-i18next'

import { useSpinDelay } from 'spin-delay'
import { Link } from '@/components/Link'
import { Spinner } from '@/components/Spinner'
import { API_URL } from '@/config'
import i18n from '@/i18n'
import { useLogout, useUser } from '@/lib/auth'
import { PATHS } from '@/routes/PATHS'
import { useProjectIdStore } from '@/stores/project'
import storage from '@/utils/storage'
import { useAuthorization } from '@/lib/authorization'


import { LuLanguages } from 'react-icons/lu'
import defaultUserIcon from '@/assets/icons/default-user.svg'
import manualIcon from '@/assets/icons/nav-manual.svg'
import qldaIcon from '@/assets/icons/nav-qlda.svg'
import defaultProjectImage from '@/assets/images/default-project.png'
import English from '@/assets/images/landingpage/uk-flag.png'
import VietNam from '@/assets/images/landingpage/vietnam-flag.png'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarDropDownIcon } from '@/components/SVGIcons'
import { useGetUserInfo } from '@/features/auth/api/getUserInfo'

function Navbar() {
  const { t } = useTranslation()

  const {
    data: userData,
  } = useGetUserInfo()

  const logout = useLogout()


  return (<div className="flex w-full">
      {userData && (<nav className="flex h-16 w-full justify-end gap-x-5 border-b-2 border-solid bg-white pr-5 lg:gap-x-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="flex items-center gap-x-2">
            <div className="cursor-pointer">
              <p>
                {/* {userInfoData != null
                    ? userInfoData?.name || userInfoData?.email?.split('@')[0]
                    : t('nav:friend')} */}
                {userData.userFullName.toUpperCase()}
              </p>
              <SidebarDropDownIcon width={12} height={7} viewBox="0 0 12 7" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="flex max-h-[360px] w-[220px] flex-col overflow-y-auto rounded-md bg-white p-3 shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade"
            sideOffset={-15}
          >
            <DropdownMenuItem
              asChild
              className="rounded-md p-2 hover:bg-primary-300 hover:bg-opacity-25 focus-visible:border-none focus-visible:outline-none"
            >
              <Link to={PATHS.USER_INFO}>
                {t('navbar:account')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer rounded-md p-2 hover:bg-primary-300 hover:bg-opacity-25 focus-visible:border-none focus-visible:outline-none"
              onClick={() => logout.mutate({})}
            >
              <p>{t('navbar:logout')}</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* )} */}
      </nav>)}
    </div>
  )
}

export default Navbar
