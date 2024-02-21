import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import {
  CreateDevice,
  DeviceTable,
  ComboBoxSelectDevice,
} from '../components/Device'
import { useGetDevices } from '../api/deviceAPI'
import storage from '~/utils/storage'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { type Device } from '../types'
import { convertEpochToDate } from '~/utils/transformFunc'
import { Button } from '~/components/Button'
import { useDeleteMultipleDevices } from '../api/deviceAPI/deleteMultipleDevices'

export function DeviceManage() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const [filteredComboboxData, setFilteredComboboxData] = useState<Device[]>([])
  const [offset, setOffset] = useState(0)

  const params = useParams()

  const orgId = params.orgId as string
  const projectId = storage.getProject()?.id
  const {
    data: deviceData,
    isPreviousData,
    isSuccess,
  } = useGetDevices({
    orgId,
    projectId,
    offset,
    config: { keepPreviousData: true },
  })
  const {
    mutate: mutateDeleteMultipleDevices,
    isLoading,
    isSuccess: isSuccessDeleteMultipleDevices,
  } = useDeleteMultipleDevices()
  const [rowSelection, setRowSelection] = useState({})
  const pdfHeader = useMemo(
    () => [
      t('table:no'),
      t('cloud:org_manage.org_manage.overview.name'),
      t('cloud:org_manage.group_manage.title'),
      t('billing:manage_bill.table.status'),
      t('sidebar:cloud.device_template'),
      'Key',
      t('cloud:org_manage.device_manage.table.created_at'),
    ],
    [],
  )
  const rowSelectionKey = Object.keys(rowSelection)
  const aoo = filteredComboboxData.reduce((acc, curr, index) => {
    if (rowSelectionKey.includes(curr.id)) {
      const temp = {
        [t('table:no')]: (index + 1).toString(),
        [t('cloud:org_manage.org_manage.overview.name')]: curr.name,
        [t('cloud:org_manage.group_manage.title')]: curr.group_name,
        [t('billing:manage_bill.table.status')]: curr.status,
        [t('sidebar:cloud.device_template')]: curr.template_name,
        Key: curr.key,
        [t('cloud:org_manage.device_manage.table.created_at')]:
          convertEpochToDate(curr.created_time),
      }
      acc.push(temp)
    }
    return acc
  }, [])

  return (
    <div ref={ref} className="flex grow flex-col">
      <TitleBar title={t('cloud:org_manage.device_manage.header')} />
      <div className="relative flex grow flex-col px-9 py-3 shadow-lg ">
        <div className="flex justify-between">
          <ExportTable
            refComponent={ref}
            rowSelection={rowSelection}
            aoo={aoo}
            pdfHeader={pdfHeader}
          />
          <div className="flex items-center gap-x-3">
            {Object.keys(rowSelection).length > 0 && (
              <ConfirmationDialog
                isDone={isSuccessDeleteMultipleDevices}
                icon="danger"
                title={t(
                  'cloud:org_manage.device_manage.table.delete_device_full',
                )}
                body={t(
                  'cloud:org_manage.device_manage.table.delete_multiple_device_confirm',
                )}
                triggerButton={
                  <div className="flex cursor-pointer gap-1 rounded-md bg-red-600 p-2 text-white">
                    <div>Xoá:</div>
                    <div>{Object.keys(rowSelection).length}</div>
                  </div>
                }
                confirmButton={
                  <Button
                    isLoading={isLoading}
                    type="button"
                    size="md"
                    className="bg-primary-400"
                    onClick={() =>
                      mutateDeleteMultipleDevices(
                        {
                          data: { ids: rowSelectionKey },
                        },
                        { onSuccess: () => setRowSelection({}) },
                      )
                    }
                    startIcon={
                      <img
                        src={btnSubmitIcon}
                        alt="Submit"
                        className="size-5"
                      />
                    }
                  />
                }
              />
            )}
            <CreateDevice />
            {isSuccess ? (
              <ComboBoxSelectDevice
                data={deviceData}
                setFilteredComboboxData={setFilteredComboboxData}
                offset={offset}
              />
            ) : null}
          </div>
        </div>
        <DeviceTable
          data={filteredComboboxData}
          offset={offset}
          setOffset={setOffset}
          total={deviceData?.total ?? 0}
          isPreviousData={isPreviousData}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
    </div>
  )
}
