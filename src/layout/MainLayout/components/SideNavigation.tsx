import { useTranslation } from 'react-i18next'
import { useState, type ReactNode, useEffect } from 'react'
import clsx from 'clsx'
import { useLocation } from 'react-router-dom'

import { PATHS } from '~/routes/PATHS'
import { NavLink } from '~/components/Link'
import storage from '~/utils/storage'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '~/components/Accordion'

import { LuChevronDown } from 'react-icons/lu'
import tongquanIcon from '~/assets/icons/sb-tongquan.svg'
import dammayIcon from '~/assets/icons/sb-dammay.svg'
import thietbiIcon from '~/assets/icons/sb-thietbi.svg'
import tichhopIcon from '~/assets/icons/sb-tichhop.svg'
import ungdungIcon from '~/assets/icons/sb-ungdung.svg'
import thanhtoanIcon from '~/assets/icons/sb-thanhtoan.svg'

function SideNavigation() {
  const { t } = useTranslation()

  const location = useLocation()
  const routerLink = location.pathname?.split('/')
  const projectId = storage.getProject()?.id

  const [value, setValue] = useState('cloud')

  useEffect(() => {
    setValue(routerLink[1])
  }, [routerLink[1]])

  return (
    <div className="px-8 py-7">
      <NavLink to={`${PATHS.OVER_VIEW}/${projectId}`}>
        <div
          className={clsx(
            'mb-3 flex cursor-pointer items-center gap-x-3 hover:text-primary-400',
            {
              'text-primary-400': value === 'overview',
            },
          )}
        >
          <img
            src={tongquanIcon}
            alt="Cloud"
            className="aspect-square w-[20px]"
          />
          <div>{t('sidebar:overview')}</div>
        </div>
      </NavLink>
      <Accordion
        type="single"
        collapsible
        value={value}
        onValueChange={setValue}
      >
        <AccordionItem value="device" className="border-none">
          <AccordionTrigger className="my-3 cursor-pointer justify-start gap-x-3 p-0 leading-none outline-none hover:text-primary-400 hover:no-underline data-[state=open]:text-primary-400">
            <img
              src={thietbiIcon}
              alt="Overview"
              className="aspect-square w-5"
            />
            <div>{t('sidebar:device.title')}</div>
            <LuChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
          </AccordionTrigger>
          <NavLink to={`${PATHS.DEVKIT}`}>
            <AccordionContent className="mb-1 overflow-hidden rounded-md pl-8 hover:bg-primary-300 hover:bg-opacity-25 group-last-of-type:mb-0 group-[.active]:bg-primary-300 group-[.active]:bg-opacity-25">
              {t('sidebar:device.devkit')}
            </AccordionContent>
          </NavLink>
          <NavLink to={`${PATHS.MODULE}`}>
            <AccordionContent className="mb-1 overflow-hidden rounded-md pl-8 hover:bg-primary-300 hover:bg-opacity-25 group-last-of-type:mb-0 group-[.active]:bg-primary-300 group-[.active]:bg-opacity-25">
              {t('sidebar:device.module')}
            </AccordionContent>
          </NavLink>
        </AccordionItem>

        <AccordionItem value="cloud" className="border-none">
          <AccordionTrigger className="my-3 cursor-pointer justify-start gap-x-3 p-0 leading-none outline-none hover:text-primary-400 hover:no-underline data-[state=open]:text-primary-400">
            <img
              src={dammayIcon}
              alt="Overview"
              className="aspect-square w-5"
            />
            <div>{t('sidebar:cloud.title')}</div>
            <LuChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
          </AccordionTrigger>
          <NavLink to={`${PATHS.ORG}`}>
            <AccordionContent className="mb-1 overflow-hidden rounded-md pl-8 hover:bg-primary-300 hover:bg-opacity-25 group-last-of-type:mb-0 group-[.active]:bg-primary-300 group-[.active]:bg-opacity-25">
              {t('sidebar:cloud.org_management')}
            </AccordionContent>
          </NavLink>
          <NavLink to={`${PATHS.THING_TEMPLATE}/${projectId}`}>
            <AccordionContent className="mb-1 overflow-hidden rounded-md pl-8 hover:bg-primary-300 hover:bg-opacity-25 group-last-of-type:mb-0 group-[.active]:bg-primary-300 group-[.active]:bg-opacity-25">
              {t('sidebar:cloud.flow_engine_v2')}
            </AccordionContent>
          </NavLink>
          <NavLink to={`${PATHS.FIRM_WARE}/${projectId}`}>
            <AccordionContent className="mb-1 overflow-hidden rounded-md pl-8 hover:bg-primary-300 hover:bg-opacity-25 group-last-of-type:mb-0 group-[.active]:bg-primary-300 group-[.active]:bg-opacity-25">
              {t('sidebar:cloud.firm_ware')}
            </AccordionContent>
          </NavLink>
          <NavLink to={`${PATHS.DEVICE_TEMPLATE}`}>
            <AccordionContent className="mb-1 overflow-hidden rounded-md pl-8 hover:bg-primary-300 hover:bg-opacity-25 group-last-of-type:mb-0 group-[.active]:bg-primary-300 group-[.active]:bg-opacity-25">
              {t('sidebar:cloud.device_template')}
            </AccordionContent>
          </NavLink>
          {/* <NavLink to={`${PATHS.FLOW_ENGINE}/${projectId}`}>
            <AccordionContent className="hover:bg-primary-300 group-[.active]:bg-primary-300 mb-1 overflow-hidden rounded-md pl-8 hover:bg-opacity-25 group-last-of-type:mb-0 group-[.active]:bg-opacity-25">
              {t('sidebar:cloud.flow_engine')}
            </AccordionContent>
          </NavLink> */}
          <NavLink to={`${PATHS.DASHBOARD}/${projectId}`}>
            <AccordionContent className="mb-1 overflow-hidden rounded-md pl-8 hover:bg-primary-300 hover:bg-opacity-25 group-last-of-type:mb-0 group-[.active]:bg-primary-300 group-[.active]:bg-opacity-25">
              {t('sidebar:cloud.dashboard')}
            </AccordionContent>
          </NavLink>
          <NavLink to={`${PATHS.ROLE_MANAGE}/${projectId}`}>
            <AccordionContent className="mb-1 overflow-hidden rounded-md pl-8 hover:bg-primary-300 hover:bg-opacity-25 group-last-of-type:mb-0 group-[.active]:bg-primary-300 group-[.active]:bg-opacity-25">
              {t('sidebar:cloud.role_manage')}
            </AccordionContent>
          </NavLink>
          <NavLink to={`${PATHS.CUSTOM_PROTOCOL}/${projectId}`}>
            <AccordionContent className="mb-1 overflow-hidden rounded-md pl-8 hover:bg-primary-300 hover:bg-opacity-25 group-last-of-type:mb-0 group-[.active]:bg-primary-300 group-[.active]:bg-opacity-25">
              {t('sidebar:cloud.custom_protocol')}
            </AccordionContent>
          </NavLink>
          <NavLink to={`${PATHS.DB_TEMPLATE}/${projectId}`}>
            <AccordionContent className="mb-1 overflow-hidden rounded-md pl-8 hover:bg-primary-300 hover:bg-opacity-25 group-last-of-type:mb-0 group-[.active]:bg-primary-300 group-[.active]:bg-opacity-25">
              {t('sidebar:cloud.db_template')}
            </AccordionContent>
          </NavLink>
        </AccordionItem>

        <AccordionItem value="application" className="border-none">
          <AccordionTrigger className="my-3 cursor-pointer justify-start gap-x-3 p-0 leading-none outline-none hover:text-primary-400 hover:no-underline data-[state=open]:text-primary-400">
            <img
              src={ungdungIcon}
              alt="Application"
              className="aspect-square w-5"
            />
            <div>{t('sidebar:application.title')}</div>
            <LuChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
          </AccordionTrigger>
          <NavLink to={`${PATHS.APPSDK}`}>
            <AccordionContent className="mb-1 overflow-hidden rounded-md pl-8 hover:bg-primary-300 hover:bg-opacity-25 group-last-of-type:mb-0 group-[.active]:bg-primary-300 group-[.active]:bg-opacity-25">
              {t('sidebar:application.appsdk')}
            </AccordionContent>
          </NavLink>
          <NavLink to={`${PATHS.APPDEBUG}`}>
            <AccordionContent className="mb-1 overflow-hidden rounded-md pl-8 hover:bg-primary-300 hover:bg-opacity-25 group-last-of-type:mb-0 group-[.active]:bg-primary-300 group-[.active]:bg-opacity-25">
              {t('sidebar:application.vsmart_debug')}
            </AccordionContent>
          </NavLink>
        </AccordionItem>

        <AccordionItem value="payment" className="border-none">
          <AccordionTrigger className="my-3 cursor-pointer justify-start gap-x-3 p-0 leading-none outline-none hover:text-primary-400 hover:no-underline data-[state=open]:text-primary-400">
            <img
              src={thanhtoanIcon}
              alt="Payment"
              className="aspect-square w-5"
            />
            <div>{t('sidebar:payment.title')}</div>
            <LuChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
          </AccordionTrigger>
          <NavLink to={`${PATHS.BILLING_PACKAGE}/${projectId}`}>
            <AccordionContent className="mb-1 overflow-hidden rounded-md pl-8 hover:bg-primary-300 hover:bg-opacity-25 group-last-of-type:mb-0 group-[.active]:bg-primary-300 group-[.active]:bg-opacity-25">
              {t('sidebar:payment.plgc')}
            </AccordionContent>
          </NavLink>
          <NavLink to={`${PATHS.CUSTOMER_MANAGE}/${projectId}`}>
            <AccordionContent className="mb-1 overflow-hidden rounded-md pl-8 hover:bg-primary-300 hover:bg-opacity-25 group-last-of-type:mb-0 group-[.active]:bg-primary-300 group-[.active]:bg-opacity-25">
              {t('sidebar:payment.plkh')}
            </AccordionContent>
          </NavLink>
          <NavLink to={`${PATHS.BILLING_SUBSCRIPTION}/${projectId}`}>
            <AccordionContent className="mb-1 overflow-hidden rounded-md pl-8 hover:bg-primary-300 hover:bg-opacity-25 group-last-of-type:mb-0 group-[.active]:bg-primary-300 group-[.active]:bg-opacity-25">
              {t('sidebar:payment.pldk')}
            </AccordionContent>
          </NavLink>
          <NavLink to={`${PATHS.BILLING}/${projectId}`}>
            <AccordionContent className="mb-1 overflow-hidden rounded-md pl-8 hover:bg-primary-300 hover:bg-opacity-25 group-last-of-type:mb-0 group-[.active]:bg-primary-300 group-[.active]:bg-opacity-25">
              {t('sidebar:payment.plhd')}
            </AccordionContent>
          </NavLink>
        </AccordionItem>

        <AccordionItem value="integration" className="border-none">
          <AccordionTrigger className="my-3 cursor-pointer justify-start gap-x-3 p-0 leading-none outline-none hover:text-primary-400 hover:no-underline data-[state=open]:text-primary-400">
            <img
              src={tichhopIcon}
              alt="integration"
              className="aspect-square w-5"
            />
            <div>{t('sidebar:integration.title')}</div>
            <LuChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
          </AccordionTrigger>
          <NavLink to={`${PATHS.AI}`}>
            <AccordionContent className="mb-1 overflow-hidden rounded-md pl-8 hover:bg-primary-300 hover:bg-opacity-25 group-last-of-type:mb-0 group-[.active]:bg-primary-300 group-[.active]:bg-opacity-25">
              {t('sidebar:integration.ai.title')}
            </AccordionContent>
          </NavLink>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default SideNavigation
