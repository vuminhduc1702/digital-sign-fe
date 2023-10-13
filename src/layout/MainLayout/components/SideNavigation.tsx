import { useTranslation } from 'react-i18next'
import * as Accordion from '@radix-ui/react-accordion'
import { forwardRef, useState, type ReactNode } from 'react'
import clsx from 'clsx'

import { PATHS } from '~/routes/PATHS'
import { Link, NavLink } from '~/components/Link'
import storage from '~/utils/storage'

import tongquanIcon from '~/assets/icons/sb-tongquan.svg'
import dammayIcon from '~/assets/icons/sb-dammay.svg'
import thietbiIcon from '~/assets/icons/sb-thietbi.svg'
import tichhopIcon from '~/assets/icons/sb-tichhop.svg'
import ungdungIcon from '~/assets/icons/sb-ungdung.svg'
import thanhtoanIcon from '~/assets/icons/sb-thanhtoan.svg'
import { SidebarDropDownIcon } from '~/components/SVGIcons'

type AccordionItemProps = {
  children: ReactNode
  className?: string
  value: string
}

type AccordionOtherProps = {
  children: ReactNode
  className?: string
}

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Item
      className={clsx('overflow-hidden', className)}
      {...props}
      ref={forwardedRef}
    >
      {children}
    </Accordion.Item>
  ),
)

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionOtherProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Header className="flex">
      <Accordion.Trigger
        className={clsx(
          'my-3 flex flex-1 cursor-pointer items-center justify-between gap-x-3 leading-none outline-none hover:text-primary-400 data-[state=open]:text-primary-400',
          className,
        )}
        {...props}
        ref={forwardedRef}
      >
        <div className="flex items-center gap-x-3">{children}</div>
        <SidebarDropDownIcon width={12} height={7} viewBox="0 0 12 7" />
      </Accordion.Trigger>
    </Accordion.Header>
  ),
)

const AccordionContent = forwardRef<HTMLDivElement, AccordionOtherProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Content
      className={clsx(
        'mb-1 overflow-hidden rounded-md hover:bg-primary-300 hover:bg-opacity-25 group-last-of-type:mb-0 group-[.active]:bg-primary-300 group-[.active]:bg-opacity-25 data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown',
        className,
      )}
      {...props}
      ref={forwardedRef}
    >
      <div className="cursor-pointer py-1 pl-8">{children}</div>
    </Accordion.Content>
  ),
)

function SideNavigation() {
  const { t } = useTranslation()

  const { id: projectId } = storage.getProject()

  const [value, setValue] = useState('cloud')

  return (
    <div className="px-8 py-7">
      <div className="mb-3 flex cursor-pointer items-center gap-x-3 hover:text-primary-400">
        <img
          src={tongquanIcon}
          alt="Cloud"
          className="aspect-square w-[20px]"
        />
        <div>{t('sidebar:overview')}</div>
      </div>
      <Accordion.Root
        type="single"
        collapsible
        value={value}
        onValueChange={setValue}
      >
        <AccordionItem value="device">
          <AccordionTrigger>
            <img
              src={thietbiIcon}
              alt="Overview"
              className="aspect-square w-[20px]"
            />
            <div>{t('sidebar:device.title')}</div>
          </AccordionTrigger>
          <AccordionContent>{t('sidebar:device.devkit')}</AccordionContent>
          <AccordionContent>{t('sidebar:device.module')}</AccordionContent>
        </AccordionItem>

        <AccordionItem value="cloud">
          <AccordionTrigger>
            <img
              src={dammayIcon}
              alt="Overview"
              className="aspect-square w-[20px]"
            />
            <div>{t('sidebar:cloud.title')}</div>
          </AccordionTrigger>
          <NavLink to={`${PATHS.ORG}`}>
            <AccordionContent>
              {t('sidebar:cloud.org_management')}
            </AccordionContent>
          </NavLink>
          <NavLink to={`${PATHS.THING_TEMPLATE}/${projectId}`}>
            <AccordionContent>
              {t('sidebar:cloud.flow_engine_v2')}
            </AccordionContent>
          </NavLink>
          <NavLink to={`${PATHS.FIRM_WARE}/${projectId}`}>
            <AccordionContent>{t('sidebar:cloud.firm_ware')}</AccordionContent>
          </NavLink>
          <NavLink to={`${PATHS.DEVICE_TEMPLATE}/${projectId}`}>
            <AccordionContent>
              {t('sidebar:cloud.device_template')}
            </AccordionContent>
          </NavLink>
          <NavLink to={`${PATHS.FLOW_ENGINE}/${projectId}`}>
            <AccordionContent>
              {t('sidebar:cloud.flow_engine')}
            </AccordionContent>
          </NavLink>
          <NavLink to={`${PATHS.DASHBOARD}/${projectId}`}>
            <AccordionContent>{t('sidebar:cloud.dashboard')}</AccordionContent>
          </NavLink>
          <NavLink to={`${PATHS.ROLE_MANAGE}/${projectId}`}>
            <AccordionContent>
              {t('sidebar:cloud.role_manage')}
            </AccordionContent>
          </NavLink>
          <NavLink to={`${PATHS.CUSTOM_PROTOCOL}/${projectId}`}>
            <AccordionContent>
              {t('sidebar:cloud.custom_protocol')}
            </AccordionContent>
          </NavLink>
        </AccordionItem>

        <AccordionItem value="application">
          <AccordionTrigger>
            <img
              src={ungdungIcon}
              alt="Application"
              className="aspect-square w-[20px]"
            />
            <div>{t('sidebar:application.title')}</div>
          </AccordionTrigger>
          <AccordionContent>{t('sidebar:application.appsdk')}</AccordionContent>
          <AccordionContent>
            {t('sidebar:application.vsmart_debug')}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="payment">
          <AccordionTrigger>
            <img
              src={thanhtoanIcon}
              alt="Payment"
              className="aspect-square w-[20px]"
            />
            <div>{t('sidebar:payment.title')}</div>
          </AccordionTrigger>
          <NavLink to={`${PATHS.BILLING_PACKAGE}/${projectId}`}>
            <AccordionContent>{t('sidebar:payment.plgc')}</AccordionContent>
          </NavLink>
          <AccordionContent>{t('sidebar:payment.plkh')}</AccordionContent>
          <AccordionContent>{t('sidebar:payment.pldk')}</AccordionContent>
          <AccordionContent>{t('sidebar:payment.plhd')}</AccordionContent>
          <AccordionContent>
            <AccordionItem value="payment">
              <AccordionTrigger>
                <img
                  src={ungdungIcon}
                  alt="Application"
                  className="aspect-square w-[20px]"
                />
                <div>{t('sidebar:payment.client.title')}</div>
              </AccordionTrigger>
              <AccordionContent>
                {t('sidebar:payment.client.dshd')}
              </AccordionContent>
              <AccordionContent>
                {t('sidebar:payment.client.cuoc')}
              </AccordionContent>
            </AccordionItem>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="intergration">
          <AccordionTrigger>
            <img
              src={tichhopIcon}
              alt="Intergration"
              className="aspect-square w-[20px]"
            />
            <div>{t('sidebar:intergration.title')}</div>
          </AccordionTrigger>
          <AccordionContent>
            {t('sidebar:intergration.tracking')}
          </AccordionContent>
          <AccordionContent>
            {t('sidebar:intergration.smarthome')}
          </AccordionContent>
        </AccordionItem>
      </Accordion.Root>
    </div>
  )
}

export default SideNavigation
