import { useState } from 'react'
import { Tab } from '@headlessui/react'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'

import TitleBar from '~/components/Head/TitleBar'
import { DeviceBreadcrumbs } from '../components/Device/DeviceBreadcrumbs'

import { DeviceListIcon, DeviceLogIcon } from '~/components/SVGIcons'

export function DeviceDetail() {
  const { t } = useTranslation()

  return (
    <div>
      <TitleBar className="normal-case" title={<DeviceBreadcrumbs />} />
      <Tab.Group>
        <Tab.List className="mt-3 flex gap-x-10 bg-secondary-500 px-10">
          <Tab
            className={({ selected }) =>
              clsx(
                'py-2.5 text-body-sm font-medium leading-5 hover:text-primary-400 focus:outline-none',
                { 'text-primary-400': selected },
              )
            }
          >
            <div className="flex items-center gap-x-2">
              <DeviceListIcon width={16} height={16} viewBox="0 0 20 16" />
              <p>
                {t('cloud.org_manage.device_manage.device_detail.list_attr')}
              </p>
            </div>
          </Tab>
          <Tab
            className={({ selected }) =>
              clsx(
                'py-2.5 text-body-sm font-medium leading-5 hover:text-primary-400 focus:outline-none',
                { 'text-primary-400': selected },
              )
            }
          >
            <div className="flex items-center gap-x-2">
              <DeviceLogIcon width={16} height={16} viewBox="0 0 16 14" />
              <p>
                {t('cloud.org_manage.device_manage.device_detail.attr_log')}
              </p>
            </div>
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-3">
          <Tab.Panel className={clsx('bg-white px-10 focus:outline-none')}>
            Panel 1
          </Tab.Panel>
          <Tab.Panel className={clsx('bg-white px-10 focus:outline-none')}>
            Panel 2
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}
