import { Suspense, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import {
  AttrTable,
  CreateAttr,
} from '~/cloud/orgManagement/components/Attributes'
import TitleBar from '~/components/Head/TitleBar'
import { Spinner } from '~/components/Spinner'
import { ExportTable } from '~/components/Table/components/ExportTable'
import storage from '~/utils/storage'
import { TemplateInfo } from '../components'

import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Button } from '~/components/Button'
import { convertEpochToDate, convertType } from '~/utils/transformFunc'
import { useDeleteMultipleAttrs } from '~/cloud/orgManagement/api/attrAPI/deleteMultipleAttrs'
import { useGetAttrs } from '~/cloud/orgManagement/api/attrAPI/getAttrs'

export function Default() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const { templateId } = useParams()
  const entityType = 'TEMPLATE'
  const { data: attrsData } = useGetAttrs({ entityType, entityId: templateId })

  const projectId = storage.getProject()?.id
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
  const attrKeys = attrsData?.attributes?.reduce((acc, curr, index) => {
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
    <div className="grid grow grid-cols-1 gap-x-4">
      {projectId && templateId ? (
        <div ref={ref} className="flex flex-col gap-2 md:col-span-2">
          <Suspense
            fallback={
              <div className="flex grow items-center justify-center md:col-span-2">
                <Spinner size="xl" />
              </div>
            }
          >
            <TemplateInfo />
            <TitleBar
              title={
                t('cloud:org_manage.org_manage.attr_list') ??
                'Device template management'
              }
            />
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
                      title={t(
                        'cloud:org_manage.org_manage.table.delete_attr_full',
                      )}
                      body={t(
                        'cloud:org_manage.org_manage.table.delete_multiple_attr_confirm',
                      )}
                      triggerButton={
                        <div className="flex cursor-pointer gap-1 rounded-md bg-red-600 p-2 text-white">
                          <div>{t('btn:delete')}:</div>
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
                                  entity_type: 'TEMPLATE',
                                  entity_id: templateId,
                                },
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
                  <CreateAttr entityId={templateId} entityType="TEMPLATE" />
                  {/* dummyInput */}
                </div>
              </div>
              <AttrTable
                data={attrsData?.attributes ?? []}
                entityId={templateId}
                entityType="TEMPLATE"
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
              />
            </div>
          </Suspense>
        </div>
      ) : null}
    </div>
  )
}
