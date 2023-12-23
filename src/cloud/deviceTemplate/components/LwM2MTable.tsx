import { Menu } from '@headlessui/react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { getVNDateFormat } from '~/utils/misc'
import { Button } from '~/components/Button'
import { ConfirmationDialog } from '~/components/ConfirmationDialog'
import { Dropdown, MenuItem } from '~/components/Dropdown'
import { BaseTable } from '~/components/Table'
import { useDisclosure } from '~/utils/hooks'
import { Link } from '~/components/Link'
import { PATHS } from '~/routes/PATHS'
import storage from '~/utils/storage'
import { useParams } from 'react-router-dom'
import { type BaseTablePagination } from '~/types'
import { type EntityThing } from '~/cloud/customProtocol'

import btnDeleteIcon from '~/assets/icons/btn-delete.svg'
import btnEditIcon from '~/assets/icons/btn-edit.svg'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { BtnContextMenuIcon } from '~/components/SVGIcons'
import { type ModuleConfig } from '../types'

// function ThingTableContextMenu({
//   id,
//   name,
//   description,
// }: {
//   id: string
//   name: string
//   description: string
// }) {
//   const { t } = useTranslation()

//   const { close, open, isOpen } = useDisclosure()

//   const { mutate, isLoading, isSuccess } = useDeleteThing()

//   return (
//     <>
//       <Dropdown
//         icon={
//           <BtnContextMenuIcon
//             height={20}
//             width={10}
//             viewBox="0 0 1 20"
//             className="text-secondary-700 hover:text-primary-400"
//           />
//         }
//       >
//         <Menu.Items className="absolute right-0 z-10 mt-6 w-40 origin-top-right divide-y divide-secondary-400 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
//           <div className="p-1">
//             <MenuItem
//               icon={
//                 <img src={btnEditIcon} alt="Edit device" className="h-5 w-5" />
//               }
//               onClick={open}
//             >
//               {t('cloud:custom_protocol.thing.edit')}
//             </MenuItem>
//             <ConfirmationDialog
//               isDone={isSuccess}
//               icon="danger"
//               title={t('cloud:custom_protocol.thing.delete')}
//               body={t(
//                 'cloud:custom_protocol.thing.delete_thing_confirm',
//               ).replace('{{THINGNAME}}', name)}
//               triggerButton={
//                 <Button
//                   className="w-full justify-start border-none hover:text-primary-400"
//                   variant="trans"
//                   size="square"
//                   startIcon={
//                     <img
//                       src={btnDeleteIcon}
//                       alt="Delete thing"
//                       className="h-5 w-5"
//                     />
//                   }
//                 >
//                   {t('cloud:custom_protocol.thing.delete')}
//                 </Button>
//               }
//               confirmButton={
//                 <Button
//                   isLoading={isLoading}
//                   type="button"
//                   size="md"
//                   className="bg-primary-400"
//                   onClick={() => mutate({ id })}
//                   startIcon={
//                     <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
//                   }
//                 />
//               }
//             />
//           </div>
//         </Menu.Items>
//       </Dropdown>
//       {isOpen ? (
//         <UpdateThing
//           thingId={id}
//           name={name}
//           description={description}
//           close={close}
//           isOpen={true}
//         />
//       ) : null}
//     </>
//   )
// }

type LwM2MTableProps = {
    module_config: ModuleConfig[]
  } 

export function LwM2MTable({ module_config, ...props }: LwM2MTableProps) {
  const { t } = useTranslation()
  const projectId = storage.getProject()?.id
  const params = useParams()
  const templateId = params.templateId as string
  console.log('module_config', module_config)
  const columnHelper = createColumnHelper<ModuleConfig>()
  const columns = useMemo<ColumnDef<ModuleConfig, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => {
          const orderId = parseInt(info.row.id) + 1
          return orderId
        },
        header: () => <span>{t('table:no')}</span>,
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'name',
        header: () => <span>{t('cloud:device_template.listLwM2M.name')}</span>,
        cell: info => {
          const nameLwM2M = info.row.original.module_name
          const id = info.row.original.id
          return (
            <Link to={`${PATHS.DEVICE_TEMPLATELWM2M}/${projectId}/${templateId}/${id}`}>
              <p className="group-hover:text-primary-400 group-[.active]:text-primary-400"
                  onClick={() => console.log(`${PATHS.DEVICE_TEMPLATELWM2M}/${projectId}/${templateId}/${id}`)}>
                {nameLwM2M}
              </p>
            </Link>
          )
        },
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'idLwM2M',
        header: () => <span>{t('cloud:device_template.listLwM2M.id')}</span>,
        cell: info => {
          const idLwM2M = info.row.original.id
          return idLwM2M
        },
        footer: info => info.column.id,
      }),
      columnHelper.display({
        id: 'numberAttr',
        header: () => <span>{t('cloud:device_template.listLwM2M.numberAttr')}</span>,
        cell: info => {
          const numberAttr = info.row.original.numberOfAttributes
          return numberAttr
        },
        footer: info => info.column.id,
      }),
      // columnHelper.display({
      //   id: 'createtime',
      //   header: () => <span>{t('cloud:org_manage.org_manage.table.last_update_ts')}</span>,
      //   cell: info => {
      //     const timestamp = info.row.original.last_update_ts
      //     console.log('Timestamp:', timestamp)
      //     return timestamp
      //   },
      //   footer: info => info.column.id,
      // }),
    ],
    [],
  )
  return module_config != null && module_config?.length !== 0 ? (
    <BaseTable
      popoverClassName="absolute right-0 top-1 block"
      data={module_config}
      columns={columns}
      {...props}
    />
  ) : (
    <div className="flex grow items-center justify-center">
      {t('table:no_template')}
    </div>
  )
}
