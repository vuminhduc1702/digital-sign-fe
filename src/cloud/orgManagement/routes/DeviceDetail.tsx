import { useRef, useState } from 'react'
import { Tab } from '@headlessui/react'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import TitleBar from '~/components/Head/TitleBar'
import { DeviceBreadcrumbs } from '../components/Device'
import {
  AttrTable,
  CreateAttr,
  ComboBoxAttrLog,
  ComboBoxSelectAttr,
} from '../components/Attributes'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { type DeviceAttrLog } from '../api/attrAPI'
import { AttrLogTable } from '../components/Attributes/AttrLogTable'

import { type Attribute } from '~/types'

import { DeviceListIcon, DeviceLogIcon } from '~/components/SVGIcons'

export function DeviceDetail() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const params = useParams()
  const deviceId = params.deviceId as string

  const [filteredAttrComboboxData, setFilteredAttrComboboxData] = useState<
    Attribute[]
  >([])
  const [filteredAttrLogComboboxData, setFilteredAttrLogComboboxData] =
    useState<DeviceAttrLog[]>([])

  return (
    <div ref={ref} className="flex grow flex-col">
      <TitleBar className="normal-case" title={<DeviceBreadcrumbs />} />
      <Tab.Group>
        <Tab.List className="bg-secondary-500 mt-2 flex gap-x-10 px-10">
          <Tab
            className={({ selected }) =>
              clsx(
                'text-body-sm hover:text-primary-400 py-2.5 focus:outline-none',
                { 'text-primary-400': selected },
              )
            }
          >
            <div className="flex items-center gap-x-2">
              <DeviceListIcon width={16} height={16} viewBox="0 0 20 16" />
              <p>
                {t('cloud:org_manage.device_manage.device_detail.attr_list')}
              </p>
            </div>
          </Tab>
          <Tab
            className={({ selected }) =>
              clsx(
                'text-body-sm hover:text-primary-400 py-2.5 focus:outline-none',
                { 'text-primary-400': selected },
              )
            }
          >
            <div className="flex items-center gap-x-2">
              <DeviceLogIcon width={16} height={16} viewBox="0 0 16 14" />
              <p>
                {t('cloud:org_manage.device_manage.device_detail.attr_log')}
              </p>
            </div>
          </Tab>
          <Tab
            className={({ selected }) =>
              clsx(
                'text-body-sm hover:text-primary-400 py-2.5 focus:outline-none',
                { 'text-primary-400': selected },
              )
            }
          >
            <div className="flex items-center gap-x-2">
              <DeviceListIcon width={16} height={16} viewBox="0 0 20 16" />
              <p>
                {t(
                  'cloud:org_manage.device_manage.device_detail.MQTT_history_info_list',
                )}
              </p>
            </div>
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-2 flex grow flex-col">
          <Tab.Panel
            className={clsx('flex grow flex-col bg-white focus:outline-none')}
          >
            <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
              <div className="flex justify-between">
                <ExportTable refComponent={ref} />
                <div className="flex items-center gap-x-3">
                  <CreateAttr entityId={deviceId} entityType="DEVICE" />
                  <ComboBoxSelectAttr
                    entityId={deviceId}
                    entityType="DEVICE"
                    setFilteredComboboxData={setFilteredAttrComboboxData}
                  />
                </div>
              </div>
              <AttrTable
                data={filteredAttrComboboxData}
                entityId={deviceId}
                entityType="DEVICE"
              />
            </div>
          </Tab.Panel>
          <Tab.Panel
            className={clsx('flex grow flex-col bg-white focus:outline-none')}
          >
            <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
              <div className="flex justify-between">
                <ExportTable refComponent={ref} />
                <div className="flex items-center gap-x-3">
                  <ComboBoxAttrLog
                    setFilteredComboboxData={setFilteredAttrLogComboboxData}
                  />
                </div>
              </div>
              <AttrLogTable
                data={filteredAttrLogComboboxData}
                entityId={deviceId}
                entityType="DEVICE"
              />
            </div>
          </Tab.Panel>
          <Tab.Panel
            className={clsx('flex grow flex-col bg-white focus:outline-none')}
          >
            <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
              <div className="flex justify-between">
                <ExportTable refComponent={ref} />
                <div className="flex items-center gap-x-3">
                  <ComboBoxAttrLog
                    setFilteredComboboxData={setFilteredAttrLogComboboxData}
                  />
                </div>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}
