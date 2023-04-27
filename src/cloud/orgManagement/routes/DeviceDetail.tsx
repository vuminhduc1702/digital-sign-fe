import { useState } from 'react'
import { Tab } from '@headlessui/react'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import TitleBar from '~/components/Head/TitleBar'
import { DeviceBreadcrumbs } from '../components/Device/DeviceBreadcrumbs'
import {
  AttrTable,
  ComboBoxSelectAttr,
  CreateAttr,
  ComboBoxAttrLog,
} from '../components/Attributes'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { useDeviceById } from '../api/deviceAPI'
import { type DeviceAttrLog, useAttrLog } from '../api/attrAPI'
import { AttrLogTable } from '../components/Attributes/AttrLogTable'

import { type Attribute } from '~/types'

import { DeviceListIcon, DeviceLogIcon } from '~/components/SVGIcons'

export function DeviceDetail() {
  const { t } = useTranslation()

  const params = useParams()
  const deviceId = params.deviceId as string
  const { data: deviceByIdData } = useDeviceById({ deviceId })

  const [filteredAttrComboboxData, setFilteredAttrComboboxData] = useState<
    Attribute[]
  >([])
  const [filteredAttrLogComboboxData, setFilteredAttrLogComboboxData] =
    useState<DeviceAttrLog[]>([])

  const { data: deviceAttrData } = useAttrLog({
    entityId: deviceId,
    entityType: 'DEVICE',
  })

  return (
    <div className="flex grow flex-col">
      <TitleBar className="normal-case" title={<DeviceBreadcrumbs />} />
      <Tab.Group>
        <Tab.List className="mt-2 flex gap-x-10 bg-secondary-500 px-10">
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
        <Tab.Panels className="mt-2 flex grow flex-col">
          <Tab.Panel
            className={clsx('flex grow flex-col bg-white focus:outline-none')}
          >
            <div className="flex grow flex-col px-9 py-3 shadow-lg">
              <div className="flex justify-between">
                <ExportTable />
                <div className="flex items-center gap-x-3">
                  <CreateAttr entityId={deviceId} entityType="DEVICE" />
                  {deviceByIdData ? (
                    <ComboBoxSelectAttr
                      attrData={deviceByIdData}
                      setFilteredComboboxData={setFilteredAttrComboboxData}
                    />
                  ) : null}
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
            <div className="flex grow flex-col px-9 py-3 shadow-lg">
              <div className="flex justify-between">
                <ExportTable />
                <div className="flex items-center gap-x-3">
                  {deviceAttrData ? (
                    <ComboBoxAttrLog
                      attrLogData={deviceAttrData}
                      setFilteredComboboxData={setFilteredAttrLogComboboxData}
                    />
                  ) : null}
                </div>
              </div>
              <AttrLogTable
                data={filteredAttrLogComboboxData}
                entityId={deviceId}
                entityType="DEVICE"
              />
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}
