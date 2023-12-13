// import { useParams } from 'react-router-dom'
// import { Suspense, useRef, useState } from 'react'
// import { useTranslation } from 'react-i18next'

// import TitleBar from '~/components/Head/TitleBar'
// import { ExportTable } from '~/components/Table/components/ExportTable'
// import { TemplateInfo, TemplateSidebar } from '../components'
// import {
//   AttrTable,
//   ComboBoxSelectAttr,
//   CreateAttr,
// } from '~/cloud/orgManagement/components/Attributes'
// import { ContentLayout } from '~/layout/ContentLayout'
// import { Spinner } from '~/components/Spinner'
// import storage from '~/utils/storage'

// import { type Attribute } from '~/types'

// export function DeviceTemplateManage() {
//   const { t } = useTranslation()
//   const ref = useRef(null)

//   const [filteredComboboxData, setFilteredComboboxData] = useState<Attribute[]>(
//     [],
//   )

//   const { templateId } = useParams()

//   const projectId = storage.getProject()?.id

//   return (
//     <ContentLayout title={t('sidebar:cloud.device_template')}>
//       <div className="grid grow grid-cols-1 gap-x-4 md:grid-cols-3">
//         <div className="flex grow flex-col gap-2 md:col-span-1">
//           <TemplateSidebar />
//         </div>

//         {projectId && templateId ? (
//           <div ref={ref} className="flex flex-col gap-2 md:col-span-2">
//             <Suspense
//               fallback={
//                 <div className="flex grow items-center justify-center md:col-span-2">
//                   <Spinner size="xl" />
//                 </div>
//               }
//             >
//               <TemplateInfo />
//               <TitleBar
//                 title={
//                   t('cloud:org_manage.org_manage.attr_list') ??
//                   'Device template management'
//                 }
//               />
//               <div className="relative flex grow flex-col px-9 py-3 shadow-lg">
//                 <div className="flex justify-between">
//                   <ExportTable refComponent={ref} />
//                   <div className="flex items-center gap-x-3">
//                     <CreateAttr entityId={templateId} entityType="TEMPLATE" />
//                     <ComboBoxSelectAttr
//                       entityId={templateId}
//                       entityType="TEMPLATE"
//                       setFilteredComboboxData={setFilteredComboboxData}
//                     />
//                   </div>
//                 </div>
//                 <AttrTable
//                   data={filteredComboboxData}
//                   entityId={templateId}
//                   entityType="TEMPLATE"
//                 />
//               </div>
//             </Suspense>
//           </div>
//         ) : null}
//       </div>
//     </ContentLayout>
//   )
// }
