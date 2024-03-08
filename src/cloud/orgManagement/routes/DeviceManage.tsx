import { useMemo, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { CreateDevice, DeviceTable } from '../components/Device'
import { useGetDevices } from '../api/deviceAPI'
import storage from '~/utils/storage'
import { convertEpochToDate } from '~/utils/transformFunc'
import { useDeleteMultipleDevices } from '../api/deviceAPI/deleteMultipleDevices'
import { SearchField } from '~/components/Input'
import { useDisclosure } from '~/utils/hooks'
import { ConfirmDialog } from '~/components/ConfirmDialog'
import { Authorization } from '~/lib/authorization'
import { useUser } from '~/lib/auth'

import { type UserResponse } from '~/features/auth'
import { POLICIES } from '~/lib/policies'

export function DeviceManage() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const [offset, setOffset] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const params = useParams()
  const { close, open, isOpen } = useDisclosure()

  const data = useUser()
  const userDataFromStorage = data.data as UserResponse

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

  useEffect(() => {
    if (isSuccessDeleteMultipleDevices) {
      close()
    }
  }, [isSuccessDeleteMultipleDevices])

  const [rowSelection, setRowSelection] = useState({})
  const pdfHeader = useMemo(
    () => [
      t('table:no'),
      t('cloud:org_manage.device_manage.table.name'),
      t('cloud:org_manage.device_manage.table.group'),
      t('cloud:org_manage.device_manage.table.status'),
      t('sidebar:cloud.device_template'),
      t('cloud:org_manage.device_manage.table.key'),
      t('cloud:org_manage.device_manage.table.created_at'),
    ],
    [],
  )
  const rowSelectionKey = Object.keys(rowSelection)
  const aoo: Array<{ [key: string]: unknown }> | undefined =
    deviceData?.devices?.reduce(
      (acc, curr, index) => {
        if (rowSelectionKey.includes(curr.id)) {
          const temp = {
            [t('table:no')]: (index + 1 + offset).toString(),
            [t('cloud:org_manage.device_manage.table.name')]: curr.name,
            [t('cloud:org_manage.device_manage.table.group')]: curr.group_name,
            [t('cloud:org_manage.device_manage.table.status')]: curr.status,
            [t('sidebar:cloud.device_template')]: curr.template_name,
            [t('cloud:org_manage.device_manage.table.key')]: curr.key,
            [t('cloud:org_manage.device_manage.table.created_at')]:
              convertEpochToDate(curr.created_time),
          }
          acc.push(temp)
        }
        return acc
      },
      [] as Array<{ [key: string]: unknown }>,
    )

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
          <div className="mr-[42px] flex items-center gap-x-3">
            {Object.keys(rowSelection).length > 0 && (
              <div
                onClick={open}
                className="flex cursor-pointer gap-1 rounded-md bg-red-600 p-2 text-white"
              >
                <div>{t('btn:delete')}:</div>
                <div>{Object.keys(rowSelection).length}</div>
              </div>
            )}
            <Authorization
              // policyCheck={POLICIES['device:create'](
              //   userDataFromStorage,
              // )}
              allowedRoles={['TENANT', 'SYSTEM_ADMIN']} // or allowedRoles={ROLES} if you want to allow access to all roles
            >
              <div className="flex justify-between">
                <CreateDevice />
              </div>
            </Authorization>
            <SearchField
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        </div>
        <DeviceTable
          data={deviceData?.devices ?? []}
          offset={offset}
          setOffset={setOffset}
          total={deviceData?.total ?? 0}
          isPreviousData={isPreviousData}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
      {isOpen ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:org_manage.device_manage.table.delete_device_full')}
          body={t(
            'cloud:org_manage.device_manage.table.delete_multiple_device_confirm',
          )}
          close={close}
          isOpen={isOpen}
          handleSubmit={() =>
            mutateDeleteMultipleDevices(
              {
                data: { ids: rowSelectionKey },
              },
              { onSuccess: () => setRowSelection({}) },
            )
          }
          isLoading={isLoading}
        />
      ) : null}
    </div>
  )
}
