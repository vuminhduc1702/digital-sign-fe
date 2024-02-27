import { useMemo, useRef, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { AttrTable, CreateAttr } from '../components/Attributes'
import { GroupBreadcrumbs } from '../components/Group/GroupBreadcrumbs'

import { useTranslation } from 'react-i18next'
import { Button } from '~/components/Button'

import { convertEpochToDate, convertType } from '~/utils/transformFunc'
import { useGetAttrs } from '../api/attrAPI'
import { useDeleteMultipleAttrs } from '../api/attrAPI/deleteMultipleAttrs'
import { SearchField } from '~/components/Input'
import { useDisclosure } from '~/utils/hooks'
import { ConfirmDialog } from '~/components/ConfirmDialog'

export function GroupDetail() {
  const params = useParams()
  const groupId = params.groupId as string
  const ref = useRef(null)
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const { close, open, isOpen } = useDisclosure()

  const entityType = 'GROUP'

  const { data: attrsData } = useGetAttrs({ entityType, entityId: groupId })

  const {
    mutate: mutateDeleteMultipleAttrs,
    isLoading,
    isSuccess: isSuccessDeleteMultipleAttrs,
  } = useDeleteMultipleAttrs()

  useEffect(() => {
    if (isSuccessDeleteMultipleAttrs) {
      close()
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
  const aoo: Array<{ [key: string]: string }> | undefined =
    attrsData?.attributes?.reduce((acc, curr, index) => {
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
    }, [] as Array<{ [key: string]: string }>)

  return (
    <div ref={ref} className="flex grow flex-col">
      <TitleBar className="normal-case" title={<GroupBreadcrumbs />} />
      <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
        <div className="flex justify-between">
          <ExportTable
            refComponent={ref}
            rowSelection={rowSelection}
            aoo={aoo}
            pdfHeader={pdfHeader}
          />
          <div className="flex items-center gap-x-3">
            {Object.keys(rowSelection).length > 0 && (
              <div onClick={open} className="flex cursor-pointer gap-1 rounded-md bg-red-600 p-2 text-white">
                <div>{t('btn:delete')}:</div>
                <div>{Object.keys(rowSelection).length}</div>
              </div>
            )}
            <CreateAttr entityId={groupId} entityType="GROUP" />
            <SearchField
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        </div>
        <AttrTable
          data={attrsData?.attributes ?? []}
          entityId={groupId}
          entityType={entityType}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
      {isOpen ? (
        <ConfirmDialog
          icon="danger"
          title={t('cloud:org_manage.org_manage.table.delete_attr_full')}
          body={t(
            'cloud:org_manage.org_manage.table.delete_multiple_attr_confirm',
          )}
          close={close}
          isOpen={isOpen}
          handleSubmit={() => mutateDeleteMultipleAttrs(
            {
              data: {
                keys: attrKeys,
                entity_type: 'GROUP',
                entity_id: groupId,
              },
            },
            { onSuccess: () => setRowSelection({}) },
          )}
          isLoading={isLoading}
        />
      ) : null}
    </div>
  )
}
