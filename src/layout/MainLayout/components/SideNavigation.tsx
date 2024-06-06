import { useTranslation } from 'react-i18next'
import { useState, type ReactNode, useEffect } from 'react'
import clsx from 'clsx'
import { useLocation } from 'react-router-dom'

import { PATHS } from '@/routes/PATHS'
import { NavLink } from '@/components/Link'
import storage from '@/utils/storage'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'

import {
  LuChevronDown,
  LuClock4,
  LuPencilLine,
  LuShield,
  LuShieldCheck,
} from 'react-icons/lu'
import tongquanIcon from '@/assets/icons/sb-tongquan.svg'
import dammayIcon from '@/assets/icons/sb-dammay.svg'
import thietbiIcon from '@/assets/icons/sb-thietbi.svg'
import tichhopIcon from '@/assets/icons/sb-tichhop.svg'
import ungdungIcon from '@/assets/icons/sb-ungdung.svg'
import thanhtoanIcon from '@/assets/icons/sb-thanhtoan.svg'

function SideNavigation() {
  const { t } = useTranslation()

  const location = useLocation()
  const routerLink = location.pathname?.split('/')
  const [value, setValue] = useState('sign')

  useEffect(() => {
    setValue(routerLink[1])
  }, [routerLink[1]])

  return (
    <div className="p-2">
      <NavLink to={PATHS.SIGN}>
        <div
          className={clsx(
            'mb-3 flex cursor-pointer items-center gap-x-3 rounded-md px-3 py-2',
            {
              'bg-primary-400 text-white': value === 'sign',
            },
          )}
        >
          <LuPencilLine />
          <div>{t('sidebar:sign')}</div>
        </div>
      </NavLink>
      <NavLink to={PATHS.CERTIFICATE}>
        <div
          className={clsx(
            'mb-3 flex cursor-pointer items-center gap-x-3 rounded-md px-3 py-2',
            {
              'bg-primary-400 text-white': value === 'certificate',
            },
          )}
        >
          <LuShield />
          <div>{t('sidebar:certificate')}</div>
        </div>
      </NavLink>
      <NavLink to={PATHS.VERIFY}>
        <div
          className={clsx(
            'mb-3 flex cursor-pointer items-center gap-x-3 rounded-md px-3 py-2',
            {
              'bg-primary-400 text-white': value === 'verify',
            },
          )}
        >
          <LuShieldCheck />
          <div>{t('sidebar:verify')}</div>
        </div>
      </NavLink>
      <NavLink to={PATHS.HISTORY}>
        <div
          className={clsx(
            'mb-3 flex cursor-pointer items-center gap-x-3 rounded-md px-3 py-2',
            {
              'bg-primary-400 text-white': value === 'history',
            },
          )}
        >
          <LuClock4 />
          <div>{t('sidebar:history')}</div>
        </div>
      </NavLink>
    </div>
  )
}

export default SideNavigation
