import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { CertificateRequest } from "../types"
import { LuPlus } from "react-icons/lu"
import { BaseTable } from "@/components/Table"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { certRequestList } from "../mock-data"
import { convertDate } from "@/utils/moment"

const status = [
    {
        value: '1',
        label: 'Đang chờ duyệt'
    },
    {
        value: '2',
        label: 'Được phê duyệt'
    },
    {
        value: '3',
        label: 'Bị từ chối'
    },
    {
        value: '4',
        label: "Đã tạo chứng thư"
    }
]

type RequestStatusProps = {
    actionId: number
    actionDesc: string
}

function RequestStatus({actionId, actionDesc}: RequestStatusProps) {
    switch (actionId) {
        case 1: return <span className="text-yellow-600">Đang chờ duyệt</span>
        case 2: return <span className="text-green-600">Được phê duyệt</span>
        case 3: return <span className="text-red-600">Bị từ chối</span>
        case 4: return <span className="text-secondary-700">Đã tạo chứng thư</span>
    }
}

type RequestActionProps = {
    request: CertificateRequest
}

function RequestAction({request}: RequestActionProps) {
    if (request.actionId !== 2) return
    return <div className="flex">
        <div className="flex cursor-pointer justify-center p-3">
            <div className="flex items-center gap-2 text-sm text-secondary-800 transition-all duration-200 ease-in-out hover:scale-105 hover:text-black">
            <LuPlus />
            Tạo chứng thư
            </div>
        </div>
    </div>
}

export function RequestTable({}) {
    const {t} = useTranslation()

    const [page, setPage] = useState<number>(1)

    const pagePrev = useRef<number>(page)

    const form = useForm()

    const {setValue, getValues, watch, register, control} = form

    // useEffect(() => {
    //     if (!isPreviousData) {
    //       pagePrev.current = page
    //     }
    //   }, [isPreviousData, page])

    const columnHelper = createColumnHelper<CertificateRequest>()
    const columns  = useMemo<ColumnDef<CertificateRequest, any>[]>(
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
              columnHelper.accessor('registTs', {
                id: 'registTs',
                header: () => <span>{t('request:regist_ts')}</span>,
                cell: info => convertDate(info.row.original.registTs),
                footer: info => info.column.id,
              }),
              columnHelper.accessor('updateTs', {
                id: 'updateTs',
                header: () => <span>{t('request:update_ts')}</span>,
                cell: info => convertDate(info.row.original.updateTs),
                footer: info => info.column.id,
              }),
              columnHelper.accessor('isValid', {
                id: 'isValid',
                header: () => <span>{t('request:is_valid')}</span>,
                cell: info => {
                    return info.row.original.isValid ? 'Hợp lệ' : 'Không hợp lệ'
                },
                footer: info => info.column.id,
              }),
              columnHelper.accessor('actionId', {
                id: 'actionId',
                header: () => <span>{t('request:status')}</span>,
                cell: info => {
                    return RequestStatus({actionId: info.row.original.actionId, actionDesc: info.row.original.actionDesc})
                },
                footer: info => info.column.id,
              }),
              columnHelper.display({
                id: 'action',
                header: () => <span>{t('request:action')}</span>,
                cell: info => {
                  return RequestAction({ request: info.row.original })
                },
                footer: info => info.column.id,
              }),
        ],
        []
    )

    return (
    <div className="bg-white p-6 rounded-lg">
        <div className="flex items-end justify-between">
            <div className="w-full my-4">
            <Form {...form}>
                <form>
                    <FormField 
                        control = {control}
                        name = "filterByStatus"
                        render = {({field}) => (
                            <FormItem className="w-1/5">
                                <FormLabel>
                                    {t('request:filter')}
                                </FormLabel>
                                <FormControl>
                                    <div>
                                        <Select {...field}>
                                            <SelectTrigger>
                                                <SelectValue defaultValue='' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {status.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </FormControl>
                            </FormItem>
                            )}
                        />
                    </form>
                </Form>
                </div>
                <Button className="w-36 h-9" variant="primary" startIcon={<LuPlus className="w-4 h-4"/>}>
                    {t('request:new_request')}
                </Button>
            </div>
        <BaseTable 
            data = {certRequestList}
            columns = {columns}
            isCheckbox = {false}
            offset = {page}
            setOffset = {setPage}
            total = {0}
            isLoading = {false}
            isPreviousData = {false}
        />
        </div>)
}