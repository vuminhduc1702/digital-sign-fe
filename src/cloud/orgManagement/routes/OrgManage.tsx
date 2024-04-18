import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import {
  AttrTable,
  CreateAttr,
} from '@/cloud/orgManagement/components/Attributes'
import TitleBar from '@/components/Head/TitleBar'
import { ExportTable } from '@/components/Table/components/ExportTable'
import { API_URL } from '@/config'
import { useOrgById } from '@/layout/OrgManagementLayout/api'
import { lazyImport } from '@/utils/lazyImport'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { SearchField } from '@/components/Input'
import { useDisclosure } from '@/utils/hooks'
import { convertEpochToDate, convertType } from '@/utils/transformFunc'
import { useGetAttrs } from '../api/attrAPI'
import { useDeleteMultipleAttrs } from '../api/attrAPI/deleteMultipleAttrs'
import { Button } from '@/components/Button'

import defaultOrgImage from '@/assets/images/default-org.png'

const { OrgMap } = lazyImport(() => import('./OrgMap'), 'OrgMap')

export function OrgManage() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const params = useParams()
  const orgId = params.orgId as string

  const [searchQuery, setSearchQuery] = useState('')
  const {
    close: closeDeleteMulti,
    open: openDeleteMulti,
    isOpen: isOpenDeleteMulti,
  } = useDisclosure()
  const { data: orgByIdData } = useOrgById({ orgId })
  const {
    data: attrsData,
    isLoading: isLoadingAttrs,
    isPreviousData: isPreviousDataAttrs,
  } = useGetAttrs({
    entityType: 'ORGANIZATION',
    entityId: orgId,
  })

  const {
    mutate: mutateDeleteMultipleAttrs,
    isLoading,
    isSuccess: isSuccessDeleteMultipleAttrs,
  } = useDeleteMultipleAttrs()
  const [isSearchData, setIsSearchData] = useState<boolean>(false)

  useEffect(() => {
    if (isSuccessDeleteMultipleAttrs) {
      closeDeleteMulti()
    }
  }, [isSuccessDeleteMultipleAttrs])

  const [rowSelection, setRowSelection] = useState({})
  const pdfHeader = useMemo(
    () => [
      t('table:no'),
      t('cloud:org_manage.org_manage.table.attr_key'),
      t('cloud:org_manage.org_manage.table.value_type'),
      t('cloud:org_manage.org_manage.table.value'),
      t('cloud:org_manage.org_manage.table.logged'),
      t('cloud:org_manage.org_manage.table.last_update_ts'),
    ],
    [],
  )
  const rowSelectionKey = Object.keys(rowSelection)
  const attrKeys = attrsData?.attributes?.reduce((acc, curr, index) => {
    if (rowSelectionKey.includes(index.toString())) {
      acc.push(curr.attribute_key)
    }
    return acc
  }, [])
  const formatExcel = attrsData?.attributes?.reduce(
    (acc, curr, index) => {
      if (rowSelectionKey.includes(index.toString())) {
        const temp = {
          [t('table:no')]: (index + 1).toString(),
          [t('cloud:org_manage.org_manage.table.attr_key')]: curr.attribute_key,
          [t('cloud:org_manage.org_manage.table.value_type')]: convertType(
            curr.value_type,
          ),
          [t('cloud:org_manage.org_manage.table.value')]: curr.value,
          [t('cloud:org_manage.org_manage.table.logged')]: curr.logged,
          [t('cloud:org_manage.org_manage.table.last_update_ts')]:
            convertEpochToDate(curr.last_update_ts / 1000),
        }
        acc.push(temp)
      }
      return acc
    },
    [] as Array<{ [key: string]: unknown }>,
  )

  return (
    <>
      {orgId ? (
        <div ref={ref} className="flex grow flex-col gap-y-3">
          <div>
            <TitleBar title={t('cloud:org_manage.org_manage.overview.title')} />
            <div className="flex gap-6 px-11 py-3 shadow-lg">
              <div className="flex flex-none items-center">
                <img
                  src={`${
                    orgByIdData?.image
                      ? `${API_URL}/file/${orgByIdData?.image}`
                      : defaultOrgImage
                  }`}
                  onError={e => {
                    const target = e.target as HTMLImageElement
                    target.onerror = null
                    target.src = defaultOrgImage
                  }}
                  alt="Organization"
                  className="h-36 w-32"
                />
              </div>
              <div className="flex flex-col gap-4">
                <p>{t('cloud:org_manage.org_manage.overview.name')}</p>
                <p>{t('cloud:org_manage.org_manage.overview.desc')}</p>
              </div>
              <div className="flex flex-col gap-4">
                <p>{orgByIdData?.name}</p>
                <p>{orgByIdData?.description}</p>
              </div>
            </div>
          </div>
          <div className="flex grow flex-col">
            <TitleBar title={t('cloud:org_manage.org_manage.attr_list')} />
            <div className="relative flex h-full grow flex-col gap-5 px-9 py-3 shadow-lg">
              <div className="flex justify-between">
                <div className="flex w-full items-center justify-between gap-x-3">
                  <SearchField
                    setSearchValue={setSearchQuery}
                    setIsSearchData={setIsSearchData}
                    closeSearch={true}
                  />
                  <CreateAttr entityId={orgId} entityType="ORGANIZATION" />
                </div>
              </div>
              <AttrTable
                data={attrsData?.attributes ?? []}
                entityId={orgId}
                entityType="ORGANIZATION"
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
                isPreviousData={isPreviousDataAttrs}
                isLoading={isLoadingAttrs}
                pdfHeader={pdfHeader}
                formatExcel={formatExcel}
                isSearchData={searchQuery.length > 0 && isSearchData}
                utilityButton={
                  Object.keys(rowSelection).length > 0 && (
                    <div className="flex items-center">
                      <Button
                        size="sm"
                        onClick={openDeleteMulti}
                        className="h-full min-w-[60px] rounded-none border-none hover:opacity-80"
                      >
                        <div>{t('btn:delete')}:</div>
                        <div>{Object.keys(rowSelection).length}</div>
                      </Button>
                    </div>
                  )
                }
              />
            </div>
          </div>
        </div>
      ) : (
        <OrgMap />
      )}
      {isOpenDeleteMulti ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:org_manage.org_manage.table.delete_attr_full')}
          body={t(
            'cloud:org_manage.org_manage.table.delete_multiple_attr_confirm',
          )}
          close={closeDeleteMulti}
          isOpen={isOpenDeleteMulti}
          handleSubmit={() =>
            mutateDeleteMultipleAttrs(
              {
                data: {
                  keys: attrKeys,
                  entity_type: 'ORGANIZATION',
                  entity_id: orgId,
                },
              },
              { onSuccess: () => setRowSelection({}) },
            )
          }
          isLoading={isLoading}
        />
      ) : null}
    </>
  )
}
