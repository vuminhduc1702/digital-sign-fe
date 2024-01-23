import { Suspense, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import TitleBar from '~/components/Head/TitleBar'
import { Spinner } from '~/components/Spinner'
import { ExportTable } from '~/components/Table/components/ExportTable'
import { ContentLayout } from '~/layout/ContentLayout'
import storage from '~/utils/storage'
import { DataBaseSidebar, DataBaseTable } from '../components'

import { useSelectDataBase } from '../api/selectDataBase'
import CreateColumn from '../components/CreateColumn'
import CreateRows from '../components/CreateRows'
import { FieldsRows } from '../types'

export function DataBaseTemplateManage() {
  const { t } = useTranslation()
  const ref = useRef(null)

  const [filteredComboboxData, setFilteredComboboxData] = useState<
    FieldsRows[]
  >([])

  const { tableName } = useParams()

  const projectId = storage.getProject()?.id

  const { data, mutate, isLoading } = useSelectDataBase()

  useEffect(() => {
    if (tableName) {
      mutate({ table: tableName, project_id: projectId })
    }
  }, [tableName])

  const refetchData = () => {
    if (tableName) {
      mutate({ table: tableName, project_id: projectId })
    }
  }

  useEffect(() => {
    if (data?.data?.columns) {
      let result = []
      const lc = data?.data?.columns.length
      const lr = data?.data?.rows.length
      for (var i = 0; i < lr; i++) {
        var dataRow = data?.data?.rows?.[i]
        const row: FieldsRows = {}
        for (var j = 0; j < lc; j++) row[data?.data?.columns?.[j]] = dataRow[j]
        result.push(row)
      }
      setFilteredComboboxData(result)
    }
  }, [data])

  return (
    <ContentLayout title={t('sidebar:cloud.db_template')}>
      <div className="grid grow grid-cols-1 gap-x-4 md:grid-cols-3">
        <div className="flex grow flex-col gap-2 md:col-span-1">
          <DataBaseSidebar />
        </div>

        {projectId && tableName ? (
          <div ref={ref} className="flex flex-col gap-2 md:col-span-2">
            <Suspense
              fallback={
                <div className="flex grow items-center justify-center md:col-span-2">
                  <Spinner size="xl" />
                </div>
              }
            >
              <TitleBar title={t('sidebar:cloud.db_template')} />
              <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
                <div className="flex justify-between">
                  <ExportTable refComponent={ref} />
                  <div className="flex items-center gap-x-3">
                    <CreateRows onClose={refetchData} columnsProp={data?.data?.columns || []} />
                    {/* <ComboBoxSelectAttr
                      entityId={tableName}
                      entityType="TEMPLATE"
                      setFilteredComboboxData={setFilteredComboboxData}
                    /> */}
                  </div>
                </div>
                {data?.data?.columns && (
                  <DataBaseTable
                    columnsProp={data?.data?.columns}
                    data={filteredComboboxData}
                    onClose={refetchData}
                  />
                )}
                <CreateColumn onClose={refetchData}/>
              </div>
            </Suspense>
          </div>
        ) : null}
      </div>
    </ContentLayout>
  )
}
