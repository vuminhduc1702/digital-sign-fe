import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLogout, useUser } from '@/lib/auth'
import { useUserInfo } from '@/cloud/orgManagement/api/userAPI'
import { useSpinDelay } from 'spin-delay'
import { Spinner } from '@/components/Spinner'
import { Button } from '@/components/Button'
import { PATHS } from '@/routes/PATHS'
import { API_URL } from '@/config'
import defaultUserIcon from '@/assets/icons/default-user.svg'
import { SidebarDropDownIcon } from '@/components/SVGIcons'
import { Link } from '@/components/Link'
import LogoViettel from '@/assets/icons/logo_viettel.svg'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenu,
} from '@/components/Dropdowns'

function LPnavigation({
  childToParent,
}: {
  childToParent: (childdata: string) => void
}) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const request_scrollToIntro = (destination: string) => {
    childToParent(destination)
  }

  const { data: userDataFromStorage } = useUser()
  const { data: userInfoData, isLoading: userInfoIsLoading } = useUserInfo({
    config: {
      suspense: false,
      enabled: !!userDataFromStorage,
    },
  })

  const showSpinner = useSpinDelay(userInfoIsLoading, {
    delay: 150,
    minDuration: 300,
  })

  const logout = useLogout()

  return (
    <div className="py-10">
      <div className="mb-[20px] w-[140px]">
        <a href="/" className=" text-white ">
          <img src={LogoViettel} alt="" />
        </a>
      </div>
      {showSpinner && userInfoData != null ? (
        <div className="flex items-center justify-center">
          <Spinner showSpinner={showSpinner} size="md" className="text-white" />
        </div>
      ) : userInfoData == null && userDataFromStorage == null ? (
        <div className="flex gap-6 px-3 py-5 ">
          <div className="flex min-w-fit items-center justify-center text-white">
            <Button
              type="button"
              className="w-full border-none bg-transparent px-1 font-bold text-white"
              variant="primary"
              onClick={() => navigate(PATHS.LOGIN)}
            >
              {t('user:login')}
            </Button>
          </div>
          <div className="mx-1 flex min-w-fit items-center justify-center text-white">
            <Button
              type="button"
              className="w-full rounded-r-lg rounded-tl-lg bg-red-950 px-5 text-left font-bold text-white"
              variant="primary"
              onClick={() => navigate(PATHS.REGISTER)}
            >
              {t('landingpage:register_now')}
            </Button>
          </div>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-x-2">
            <div className="flex lg:ml-auto">
              <div className="flex w-max py-5 max-lg:px-3">
                <img
                  src={`${
                    userInfoData?.profile?.profile_image !== ''
                      ? `${API_URL}/file/${userInfoData?.profile?.profile_image}`
                      : defaultUserIcon
                  }`}
                  alt="User's avatar"
                  className="aspect-square w-10 rounded-full p-1 ring-2 ring-gray-300"
                  onError={e => {
                    const target = e.target as HTMLImageElement
                    target.onerror = null
                    target.src = defaultUserIcon
                  }}
                />

                <div className="mx-4 flex cursor-pointer items-center justify-center">
                  <p className="mr-2 text-white">
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
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="z-[9999]  flex max-h-[360px] w-[220px] flex-col overflow-y-auto rounded-md bg-white p-3 shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade"
            sideOffset={-15}
          >
            <Link
              to="https://iot.viettel.vn/"
              target="_blank"
              className="cursor-pointer"
            >
              <DropdownMenuItem className="cursor-pointer rounded-md p-2 hover:bg-primary-300 hover:bg-opacity-25 focus-visible:border-none focus-visible:outline-none">
                {t('user:cmp')}
              </DropdownMenuItem>
            </Link>
            <Link to={PATHS.USER_INFO} className="cursor-pointer">
              <DropdownMenuItem className="cursor-pointer rounded-md p-2 hover:bg-primary-300 hover:bg-opacity-25 focus-visible:border-none focus-visible:outline-none">
                {t('user:user_info')}
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem className="rounded-md p-2 hover:bg-primary-300 hover:bg-opacity-25 focus-visible:border-none focus-visible:outline-none">
              {userDataFromStorage ? (
                <p
                  className="cursor-pointer"
                  onClick={() => {
                    navigate(PATHS.CHANGEPASSWORD)
                  }}
                >
                  {t('user:change_password')}
                </p>
              ) : null}
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-md p-2 hover:bg-primary-300 hover:bg-opacity-25 focus-visible:border-none focus-visible:outline-none">
              <p className="cursor-pointer" onClick={() => logout.mutate({})}>
                {t('user:logout')}
              </p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div className="flex w-full lg:justify-center">
        <div className="flex w-full">
          <div className="flex justify-start max-xl:flex-col">
            <div
              className="flex min-w-fit px-3 py-5 text-base font-bold text-white "
              onClick={() => request_scrollToIntro('introRef')}
            >
              <button>{t('landingpage:introduction')}</button>
            </div>
            <div
              className="flex min-w-fit px-3 py-5 text-base font-bold text-white  "
              onClick={() => request_scrollToIntro('PackOfDataRef')}
            >
              <button>{t('landingpage:pack_of_data')}</button>
            </div>
            <div
              className="flex min-w-fit px-3 py-5 text-base font-bold text-white "
              onClick={() => request_scrollToIntro('ProductRef')}
            >
              <button>{t('landingpage:product')}</button>
            </div>
            <div
              className="flex min-w-fit px-3 py-5 text-base font-bold text-white "
              onClick={() => request_scrollToIntro('OrderRef')}
            >
              <button>{t('landingpage:Platform_IoT')}</button>
            </div>
            <div
              className="flex min-w-fit px-3 py-5 text-base font-bold text-white "
              onClick={() => request_scrollToIntro('Order1Ref')}
            >
              <button>{t('landingpage:CMP_system')}</button>
            </div>
            <div
              className="flex min-w-fit px-3 py-5 text-base font-bold text-white "
              onClick={() => request_scrollToIntro('FAQRef')}
            >
              <button>{t('landingpage:FAQ')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LPnavigation
