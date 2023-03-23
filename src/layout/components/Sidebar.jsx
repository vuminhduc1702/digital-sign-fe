import { SidebarDropDownIcon } from '~/components/SVGIcons'
import { useTranslation } from 'react-i18next'
import * as Accordion from '@radix-ui/react-accordion'
import { useState, forwardRef, useEffect } from 'react'
import clsx from 'clsx'
import { mediaQueryPoint, useMediaQuery } from '~/utils/hooks'
import logo from '~/assets/images/logo.svg'
import tongquanIcon from '~/assets/icons/sb-tongquan.svg'
import dammayIcon from '~/assets/icons/sb-dammay.svg'
import thietbiIcon from '~/assets/icons/sb-thietbi.svg'
import tichhopIcon from '~/assets/icons/sb-tichhop.svg'
import ungdungIcon from '~/assets/icons/sb-ungdung.svg'
import thanhtoanIcon from '~/assets/icons/sb-thanhtoan.svg'
import sidebarOpenIcon from '~/assets/icons/sb-open.svg'
import sidebarCloseIcon from '~/assets/icons/sb-close.svg'

function Sidebar() {
  const { t } = useTranslation()
  const isMobile = useMediaQuery(`(max-width: ${mediaQueryPoint['md']}px)`)
  const [openSidebar, setOpenSidebar] = useState(false)

  useEffect(() => {
    if (!isMobile) {
      setOpenSidebar(true)
    } else {
      setOpenSidebar(false)
    }
  }, [isMobile])

  return (
    <>
      {isMobile ? (
        <img
          src={sidebarOpenIcon}
          alt="Open sidebar"
          className="absolute top-0 left-0 z-10 ml-[10px] mt-[25px] aspect-square w-[30px] cursor-pointer"
          onClick={() => setOpenSidebar(true)}
        />
      ) : null}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-screen w-[254px] bg-secondary-400',
          {
            block: openSidebar,
            hidden: !openSidebar,
          },
        )}
        aria-label="Sidebar"
      >
        <div className="grid h-[9vh] place-content-center border-b-[2px] border-solid bg-white">
          <img src={logo} alt="logo" className="h-[52px] w-[140px]" />
          {isMobile ? (
            <img
              src={sidebarCloseIcon}
              alt="Close sidebar"
              className="absolute top-0 right-0 mr-[10px] mt-[25px] aspect-square w-[30px] cursor-pointer"
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
              onClick={() => setOpenSidebar(false)}
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
              <AccordionContent>{t('sidebar.cloud.org_map')}</AccordionContent>
              <AccordionContent>
                {t('sidebar.cloud.org_management')}
              </AccordionContent>
              <AccordionContent>
                {t('sidebar.cloud.device_template')}
              </AccordionContent>
              <AccordionContent>
                {t('sidebar.cloud.flow_engine')}
              </AccordionContent>
              <AccordionContent>
                {t('sidebar.cloud.dashboard')}
              </AccordionContent>
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

const AccordionItem = forwardRef(
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

const AccordionTrigger = forwardRef(
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

const AccordionContent = forwardRef(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Content
      className={clsx(
        'overflow-hidden hover:bg-primary-300 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp',
        className,
      )}
      {...props}
      ref={forwardedRef}
    >
      <div className="cursor-pointer py-[5px] pl-8">{children}</div>
    </Accordion.Content>
  ),
)

export default Sidebar
