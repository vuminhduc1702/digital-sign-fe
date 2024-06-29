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
  LuUploadCloud,
} from 'react-icons/lu'

function SideNavigation() {
  const { t } = useTranslation()

  const location = useLocation()
  const routerLink = location.pathname?.split('/')
  const [value, setValue] = useState('sign')

  useEffect(() => {
    setValue(routerLink[1])
  }, [routerLink[1]])

  return (
    <div className="">
      <NavLink to={PATHS.SIGN}>
        <div
          className={clsx(
            'flex cursor-pointer items-center gap-x-3 px-3 py-4 hover:bg-primary-200 hover:text-primary-400',
            {
              'bg-primary-200 text-primary-400': value === 'sign',
            },
          )}
        >
          <LuPencilLine />
          <div>{t('sidebar:sign')}</div>
        </div>
      </NavLink>
      <NavLink to={PATHS.REQUEST}>
        <div
          className={clsx(
            'flex cursor-pointer items-center gap-x-3 px-3 py-4 hover:bg-primary-200 hover:text-primary-400',
            {
              'bg-primary-200 text-primary-400': value === 'request',
            },
          )}
        >
        <LuUploadCloud />          
        <div>{t('sidebar:request')}</div>
        </div>
      </NavLink>
      <NavLink to={PATHS.SIGN_REQUEST}>
        <div
          className={clsx(
            'flex cursor-pointer items-center gap-x-3 px-3 py-4 hover:bg-primary-200 hover:text-primary-400',
            {
              'bg-primary-200 text-primary-400': value === 'sign-request',
            },
          )}
        >
        <LuUploadCloud />          
        <div>{t('sidebar:sign_request')}</div>
        </div>
      </NavLink>
      <NavLink to={PATHS.CERTIFICATE}>
        <div
          className={clsx(
            'flex cursor-pointer items-center gap-x-3 px-3 py-4 hover:bg-primary-200 hover:text-primary-400',
            {
              'bg-primary-200 text-primary-400': value === 'certificate',
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
            'flex cursor-pointer items-center gap-x-3 px-3 py-4 hover:bg-primary-200 hover:text-primary-400',
            {
              'bg-primary-200 text-primary-400': value === 'verify',
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
            'flex cursor-pointer items-center gap-x-3 px-3 py-4 hover:bg-primary-200 hover:text-primary-400',
            {
              'bg-primary-200 text-primary-400': value === 'history',
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
