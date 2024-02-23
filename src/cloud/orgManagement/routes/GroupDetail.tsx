import { useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import TitleBar from '~/components/Head/TitleBar'
import { GroupBreadcrumbs } from '../components/Group/GroupBreadcrumbs'
import {
  AttrTable,
  CreateAttr,
} from '../components/Attributes'
import { ExportTable } from '~/components/Table/components/ExportTable'

import { type Attribute } from '~/types'
import { useDeleteMultipleAttrs } from '../api/attrAPI/deleteMultipleAttrs'
import { convertEpochToDate, convertType } from '~/utils/transformFunc'
import { Button } from '~/components/Button'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { useTranslation } from 'react-i18next'
import { useGetAttrs } from '../api/attrAPI'
import { flattenData } from '~/utils/misc'

export function GroupDetail() {
  const params = useParams()
  const groupId = params.groupId as string
  const ref = useRef(null)
  const { t } = useTranslation()

  const entityType = 'GROUP'

  const { data: attrsData } = useGetAttrs({ entityType, entityId: groupId })

  const { acc: attrFlattenData, extractedPropertyKeys } = flattenData(
    attrsData?.attributes,
    ['last_update_ts', 'attribute_key', 'logged', 'value_type', 'value'],
  )

  const {
    mutate: mutateDeleteMultipleAttrs,
    isLoading,
    isSuccess: isSuccessDeleteMultipleAttrs,
  } = useDeleteMultipleAttrs()
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
  const attrKeys = attrFlattenData.reduce((acc, curr, index) => {
    if (rowSelectionKey.includes(index.toString())) {
      acc.push(curr.attribute_key)
    }
    return acc
  }, [])
  const aoo: Array<{ [key: string]: string }> | undefined =
    attrFlattenData.reduce((acc, curr, index) => {
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
              <ConfirmationDialog
                isDone={isSuccessDeleteMultipleAttrs}
                icon="danger"
                title={t('cloud:org_manage.org_manage.table.delete_attr_full')}
                body={t(
                  'cloud:org_manage.org_manage.table.delete_multiple_attr_confirm',
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
                      mutateDeleteMultipleAttrs(
                        {
                          data: {
                            keys: attrKeys,
                            entity_type: 'GROUP',
                            entity_id: groupId,
                          },
                        },
                        { onSuccess: () => setRowSelection({}) },
                      )
                    }
                    startIcon={
                      <img
                        src={btnSubmitIcon}
                        alt="Submit"
                        className="h-5 w-5"
                      />
                    }
                  />
                }
              />
            )}
            <CreateAttr entityId={groupId} entityType="GROUP" />
            {/* dummyInput */}
          </div>
        </div>
        <AttrTable
          data={attrFlattenData}
          entityId={groupId}
          entityType={entityType}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
    </div>
  )
}
