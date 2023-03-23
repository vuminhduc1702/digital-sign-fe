import { useTranslation } from 'react-i18next'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { SidebarDropDownIcon } from '~/components/SVGIcons'
import caidatIcon from '~/assets/icons/nav-caidat.svg'
import qldaIcon from '~/assets/icons/nav-qlda.svg'
import hotroIcon from '~/assets/icons/nav-hotro.svg'
import defaultUserIcon from '~/assets/icons/default_user.svg'

function Navbar() {
  const { t } = useTranslation()

  return (
    <nav className="fixed top-0 flex h-[9vh] w-full justify-end gap-x-5 bg-secondary-900 pr-5 pl-[50px] sm:pl-0 md:pl-[254px] lg:gap-x-10">
      <div className="flex cursor-pointer items-center gap-x-2">
        <img
          src={defaultUserIcon}
          alt="User's avatar"
          className="aspect-square w-[20px]"
        />
        <p className="text-white">{t('nav.hello')} Hằng</p>
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
            className="min-w-[220px] rounded-md bg-white p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
            sideOffset={5}
          >
            <DropdownMenu.Item className="group relative flex h-[25px] cursor-pointer select-none items-center px-[5px] pl-[25px] leading-none outline-none">
              List all projects
            </DropdownMenu.Item>
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
