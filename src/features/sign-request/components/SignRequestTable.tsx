import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SignRequest } from "../types";
import { BaseTable } from "@/components/Table";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { signRequestMockData } from "../mock-data";
import { convertDate } from "@/utils/moment";
import { Link } from "@/components/Link";
import { PATHS } from "@/routes/PATHS";
import { LuEye } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const options = [
  {
    value: 'true',
    label: 'Được tạo bởi tôi'
  },
  {
    value: 'false',
    label: 'Được gửi đến tôi'
  }
]

function SignRequestTableContext({id}: {id: number}) {
  const navigate = useNavigate()
  return (
    <>
      <div className="flex">
        <div className="flex cursor-pointer justify-center p-3">
          <LuEye 
            className="text-lg text-secondary-800 transition-all duration-200 ease-in-out hover:scale-125 hover:text-black"
            onClick={() => {
              navigate(`${PATHS.SIGN_REQUEST}/${id}`)
            }}
          />
        </div>
      </div>
    </>
  )
}

export function SignRequestTable() {
    const {t} = useTranslation()

    const [page, setPage] = useState<number>(1)

    const form = useForm()

    const {control} = form

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
            header: () => <span>{t('sign_request:stt')}</span>,
            footer: info => info.column.id,
          }),
          columnHelper.accessor('fileName', {
            id: 'fileName',
            header: () => <span>{t('sign_request:file_name')}</span>,
            cell: info => info.row.original.fileName,
            footer: info => info.column.id,
          }),
          columnHelper.accessor('registTs', {
            id: 'registTs',
            header: () => <span>{t('sign_request:regist_ts')}</span>,
            cell: info => convertDate(info.row.original.registTs),
            footer: info => info.column.id,
          }),
          columnHelper.accessor('lastUpdate', {
            id: 'lastUpdate',
            header: () => <span>{t('sign_request:last_update')}</span>,
            cell: info => convertDate(info.row.original.lastUpdate),
            footer: info => info.column.id,
          }),
          columnHelper.accessor('lastUserUpdate', {
            id: 'lastUserUpdate',
            header: () => <span>{t('sign_request:last_user_update')}</span>,
            cell: info => info.row.original.lastUserUpdate,
            footer: info => info.column.id,
          }),
          columnHelper.accessor('hasSigned', {
            id: 'hasSigned',
            header: () => <span>{t('sign_request:has_signed')}</span>,
            cell: info => {
              return info.row.original.hasSigned ? "Đã ký" : "Chưa ký"
            },
            footer: info => info.column.id,
          }),
          columnHelper.display({
            id: 'action',
            header: () => <span>{t('sign_request:action')}</span>,
            cell: info => {
              const { signRequestId } = info.row.original
              return SignRequestTableContext({id: signRequestId})
            },
            footer: info => info.column.id,
          }),
     ], 
     [] 
    )

    return <div className="bg-white p-6 rounded-lg">
      <Form {...form}>
        <form className="w-1/5 my-4">
          <FormField
            control={control}
            name="type"
            render = {({field}) => (
              <FormItem>
                <FormControl>
                  <div>
                    <Select>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map(option => (
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
        <BaseTable 
            data = {signRequestMockData}
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