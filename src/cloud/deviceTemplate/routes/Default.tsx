import { useMemo, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import {
  AttrTable,
  CreateAttr,
} from '@/cloud/orgManagement/components/Attributes'
import TitleBar from '@/components/Head/TitleBar'
import { ExportTable } from '@/components/Table/components/ExportTable'
import storage from '@/utils/storage'
import { TemplateInfo } from '../components'

import { type Attribute } from '@/types'

import { Button } from '@/components/Button'
import { convertEpochToDate, convertType } from '@/utils/transformFunc'
import { useDeleteMultipleAttrs } from '@/cloud/orgManagement/api/attrAPI/deleteMultipleAttrs'
import { useGetAttrs } from '@/cloud/orgManagement/api/attrAPI/getAttrs'
import { SearchField } from '@/components/Input'
import { useDisclosure } from '@/utils/hooks'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export function Default() {
  const { t } = useTranslation()
  const ref = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchData, setIsSearchData] = useState<boolean>(false)
  const {
    close: closeAttrs,
    open: openAttrs,
    isOpen: isOpenAttrs,
  } = useDisclosure()
  const {
    close: closeDeleteMulti,
    open: openDeleteMulti,
    isOpen: isOpenDeleteMulti,
  } = useDisclosure()

  const { templateId } = useParams()
  const entityType = 'TEMPLATE'

  const {
    data: attrsData,
    isLoading: isLoadingAttrs,
    isPreviousData: isPreviousDataAttrs,
  } = useGetAttrs({
    entityType,
    entityId: templateId,
    key_search: searchQuery,
  })

  const projectId = storage.getProject()?.id
  const {
    mutate: mutateDeleteMultipleAttrs,
    isLoading,
    isSuccess: isSuccessDeleteMultipleAttrs,
  } = useDeleteMultipleAttrs()

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
  const attrKeys = attrsData?.attributes.reduce((acc, curr, index) => {
    if (rowSelectionKey.includes(index.toString())) {
      acc.push(curr.attribute_key)
    }
    return acc
  }, [])
  const formatExcel = attrsData?.attributes.reduce(
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
    <div className="grid grow grid-cols-1 gap-x-4">
      {projectId && templateId && attrsData ? (
        <div ref={ref} className="flex flex-col gap-2 md:col-span-2">
          <TemplateInfo />
          <TitleBar
            title={
              t('cloud:org_manage.org_manage.attr_list') ??
              'Device template management'
            }
          />
          <div className="relative flex h-full grow flex-col gap-5 px-9 py-3 shadow-lg">
            <div className="flex justify-between">
              <div className="flex w-full items-center justify-between gap-x-3">
                <SearchField
                  setSearchValue={setSearchQuery}
                  setIsSearchData={setIsSearchData}
                  closeSearch={true}
                />
                <Button
                  className="h-[38px] rounded border-none"
                  onClick={openAttrs}
                >
                  {t('cloud:org_manage.org_manage.add_attr.button')}
                </Button>
              </div>
            </div>
            <AttrTable
              data={attrsData?.attributes ?? []}
              entityId={templateId}
              entityType="TEMPLATE"
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
              isPreviousData={isPreviousDataAttrs}
              isLoading={isLoadingAttrs}
              pdfHeader={pdfHeader}
              formatExcel={formatExcel}
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
      ) : null}
      {isOpenAttrs && (
        <CreateAttr
          entityId={templateId}
          entityType="TEMPLATE"
          close={closeAttrs}
          open={openAttrs}
          isOpen={isOpenAttrs}
        />
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
          isSuccessDelete={isSuccessDeleteMultipleAttrs}
          handleSubmit={() =>
            mutateDeleteMultipleAttrs(
              {
                data: {
                  keys: attrKeys,
                  entity_type: 'TEMPLATE',
                  entity_id: templateId,
                },
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
