import { useTranslation } from 'react-i18next'
import { useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import {
  CreateAttr,
  AttrTable,
} from '~/cloud/orgManagement/components/Attributes'
import TitleBar from '~/components/Head/TitleBar'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { useOrgById } from '~/layout/OrgManagementLayout/api'
import { lazyImport } from '~/utils/lazyImport'
import { API_URL } from '~/config'

import { type Attribute } from '~/types'

import defaultOrgImage from '~/assets/images/default-org.png'
import { convertEpochToDate, convertType } from '~/utils/transformFunc'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Button } from '~/components/Button'
import { useDeleteMultipleAttrs } from '../api/attrAPI/deleteMultipleAttrs'
import { InputField } from '~/components/Form'

const { OrgMap } = lazyImport(() => import('./OrgMap'), 'OrgMap')

export function OrgManage() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const params = useParams()
  const orgId = params.orgId as string
  const entityType = 'ORGANIZATION'

  const [searchQuery, setSearchQuery] = useState('')
  const [data, setData] = useState<Attribute[]>([])
  const { data: orgByIdData } = useOrgById({ orgId })

  const [filteredComboboxData, setFilteredComboboxData] = useState<Attribute[]>(
    [],
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
  const attrKeys = filteredComboboxData.reduce((acc, curr, index) => {
    if (rowSelectionKey.includes(index.toString())) {
      acc.push(curr.attribute_key)
    }
    return acc
  }, [])
  const aoo: Array<{ [key: string]: string }> | undefined =
    filteredComboboxData?.reduce((acc, curr, index) => {
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
                                  entity_type: 'ORGANIZATION',
                                  entity_id: orgId,
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
                  <CreateAttr entityId={orgId} entityType="ORGANIZATION" />
                  {/* dummyInput */}
                  <InputField
                    type="text"
                    placeholder="Search"
                    onChange={e => {
                      const value = e.target.value
                      setSearchQuery(value)
                    }}
                  />
                </div>
              </div>
              <AttrTable
                entityId={orgId}
                entityType="ORGANIZATION"
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
              />
            </div>
          </div>
        </div>
      ) : (
        <OrgMap />
      )}
    </>
  )
}
