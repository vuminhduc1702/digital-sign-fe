import { useTranslation } from 'react-i18next'
import * as Accordion from '@radix-ui/react-accordion'
import { useState, forwardRef, useEffect, type ReactNode } from 'react'
import clsx from 'clsx'

import { mediaQueryPoint, useMediaQuery } from '~/utils/hooks'
import { PATHS } from '~/routes/PATHS'
import { NavLink } from '~/components/Link'
import { useProjectIdStore } from '~/stores/project'

import logo from '~/assets/images/logo.svg'
import tongquanIcon from '~/assets/icons/sb-tongquan.svg'
import dammayIcon from '~/assets/icons/sb-dammay.svg'
import thietbiIcon from '~/assets/icons/sb-thietbi.svg'
import tichhopIcon from '~/assets/icons/sb-tichhop.svg'
import ungdungIcon from '~/assets/icons/sb-ungdung.svg'
import thanhtoanIcon from '~/assets/icons/sb-thanhtoan.svg'
import sidebarOpenIcon from '~/assets/icons/sb-open.svg'
import sidebarCloseIcon from '~/assets/icons/sb-close.svg'
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
          'group my-3 flex flex-1 cursor-pointer items-center justify-between gap-x-3 leading-none outline-none hover:text-primary-400',
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
        'mb-1 overflow-hidden rounded-md hover:bg-primary-300 group-last-of-type:mb-0 group-[.active]:bg-primary-300 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp',
        className,
      )}
      {...props}
      ref={forwardedRef}
    >
      <div className="cursor-pointer py-1 pl-8">{children}</div>
    </Accordion.Content>
  ),
)

function Sidebar() {
  const { t } = useTranslation()
  const isMobileLG = useMediaQuery(`(max-width: ${mediaQueryPoint['lg']}px)`)

  const [openSidebar, setOpenSidebar] = useState(false)
  const projectId = useProjectIdStore(state => state.projectId)

  useEffect(() => {
    if (isMobileLG) {
      setOpenSidebar(false)
    } else {
      setOpenSidebar(true)
    }
  }, [isMobileLG])

  return (
    <>
      {isMobileLG ? (
        <img
          src={sidebarOpenIcon}
          alt="Open sidebar"
          className="absolute top-0 left-0 z-10 ml-2 mt-[25px] aspect-square w-[30px] cursor-pointer"
          onClick={() => setOpenSidebar(true)}
        />
      ) : null}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-screen w-[254px] bg-secondary-400 transition-opacity',
          {
            'pointer-events-auto opacity-100': openSidebar,
            'pointer-events-none opacity-0': !openSidebar,
          },
        )}
        aria-label="Sidebar"
      >
        <div className="grid h-[9vh] place-content-center border-b-[2px] border-solid bg-white">
          <img src={logo} alt="logo" className="h-[52px] w-[140px]" />
          {isMobileLG ? (
            <img
              src={sidebarCloseIcon}
              alt="Close sidebar"
              className="absolute top-0 right-0 mr-2 mt-[25px] aspect-square w-[30px] cursor-pointer"
              onClick={() => setOpenSidebar(false)}
            />
          ) : null}
        </div>
        <div className="px-8 py-7">
          <div className="mb-3 flex cursor-pointer items-center gap-x-3 hover:text-primary-400">
            <img
              src={tongquanIcon}
              alt="Cloud"
              className="aspect-square w-[20px]"
            />
            <div>{t('sidebar.overview')}</div>
          </div>

          <Accordion.Root type="single" collapsible>
            <AccordionItem value="device">
              <AccordionTrigger>
                <img
                  src={thietbiIcon}
                  alt="Overview"
                  className="aspect-square w-[20px]"
                />
                <div>{t('sidebar.device.title')}</div>
              </AccordionTrigger>
              <AccordionContent>{t('sidebar.device.devkit')}</AccordionContent>
              <AccordionContent>{t('sidebar.device.module')}</AccordionContent>
            </AccordionItem>

            <AccordionItem value="cloud">
              <AccordionTrigger>
                <img
                  src={dammayIcon}
                  alt="Overview"
                  className="aspect-square w-[20px]"
                />
                <div>{t('sidebar.cloud.title')}</div>
              </AccordionTrigger>
              <NavLink to={PATHS.ORG_INFO.replace(':projectId', projectId)}>
                <AccordionContent>
                  {t('sidebar.cloud.org_management')}
                </AccordionContent>
              </NavLink>
              <NavLink
                to={PATHS.DEVICE_TEMPLATE.replace(':projectId', projectId)}
              >
                <AccordionContent>
                  {t('sidebar.cloud.device_template')}
                </AccordionContent>
              </NavLink>
              <NavLink to={PATHS.FLOW_ENGINE.replace(':projectId', projectId)}>
                <AccordionContent>
                  {t('sidebar.cloud.flow_engine')}
                </AccordionContent>
              </NavLink>
              <NavLink to={PATHS.DASHBOARD.replace(':projectId', projectId)}>
                <AccordionContent>
                  {t('sidebar.cloud.dashboard')}
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
                <div>{t('sidebar.application.title')}</div>
              </AccordionTrigger>
              <AccordionContent>
                {t('sidebar.application.appsdk')}
              </AccordionContent>
              <AccordionContent>
                {t('sidebar.application.vsmart_debug')}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="payment">
              <AccordionTrigger>
                <img
                  src={thanhtoanIcon}
                  alt="Payment"
                  className="aspect-square w-[20px]"
                />
                <div>{t('sidebar.payment.title')}</div>
              </AccordionTrigger>
              <AccordionContent>{t('sidebar.payment.plgc')}</AccordionContent>
              <AccordionContent>{t('sidebar.payment.plkh')}</AccordionContent>
              <AccordionContent>{t('sidebar.payment.pldk')}</AccordionContent>
              <AccordionContent>{t('sidebar.payment.plhd')}</AccordionContent>
              <AccordionContent>
                <AccordionItem value="payment">
                  <AccordionTrigger>
                    <img
                      src={ungdungIcon}
                      alt="Application"
                      className="aspect-square w-[20px]"
                    />
                    <div>{t('sidebar.payment.client.title')}</div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {t('sidebar.payment.client.dshd')}
                  </AccordionContent>
                  <AccordionContent>
                    {t('sidebar.payment.client.cuoc')}
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
                <div>{t('sidebar.intergration.title')}</div>
              </AccordionTrigger>
              <AccordionContent>
                {t('sidebar.intergration.tracking')}
              </AccordionContent>
              <AccordionContent>
                {t('sidebar.intergration.smarthome')}
              </AccordionContent>
            </AccordionItem>
          </Accordion.Root>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
