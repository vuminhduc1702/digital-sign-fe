import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SignRequest } from "../types";
import { BaseTable } from "@/components/Table";

export function SignRequestTable() {
    const {t} = useTranslation()

    const [page, setPage] = useState<number>(1)

    const form = useForm()

    const columnHelper = createColumnHelper<SignRequest>()
    const columns = useMemo<ColumnDef<SignRequest, any>[]>(
     () => [
        columnHelper.display({
            id: 'stt',
            cell: info => {
              return info.row.index + page
            //   !isPreviousData
            //     ? info.row.index + page
            //     : info.row.index + pagePrev.current
            },
            header: () => <span>{t('request:stt')}</span>,
            footer: info => info.column.id,
          }),
          columnHelper.accessor('fileName', {
            id: 'fileName',
            header: () => <span>{t('request:regist_ts')}</span>,
            cell: info => info.row.original.fileName,
            footer: info => info.column.id,
          }),
          columnHelper.accessor('registTs', {
            id: 'registTs',
            header: () => <span>{t('request:regist_ts')}</span>,
            cell: info => info.row.original.registTs,
            footer: info => info.column.id,
          }),
          columnHelper.accessor('lastUpdate', {
            id: 'lastUpdate',
            header: () => <span>{t('request:regist_ts')}</span>,
            cell: info => info.row.original.lastUpdate,
            footer: info => info.column.id,
          }),
          columnHelper.accessor('lastUserUpdate', {
            id: 'lastUserUpdate',
            header: () => <span>{t('request:regist_ts')}</span>,
            cell: info => info.row.original.lastUserUpdate,
            footer: info => info.column.id,
          }),
          columnHelper.accessor('hasSigned', {
            id: 'hasSigned',
            header: () => <span>{t('request:regist_ts')}</span>,
            cell: info => info.row.original.hasSigned,
            footer: info => info.column.id,
          }),
          columnHelper.display({
            id: 'action',
            header: () => <span>{t('request:action')}</span>,
            cell: info => {
              return 'chi tiết'
            },
            footer: info => info.column.id,
          }),
     ], 
     [] 
    )

    return <div>
        <BaseTable 
            data = {[]}
            columns = {columns}
            isCheckbox = {false}
            offset = {page}
            setOffset = {setPage}
            total = {0}
            isLoading = {false}
            isPreviousData = {false}
        />
        </div>
}