import TitleBar from "@/components/Head/TitleBar"
import { useTranslation } from "react-i18next"
import { SignRequestDetailBox } from "./components/SignRequestDetailBox"
import { signRequestDetail, userList } from "./mock-data"
import { BaseTable } from "@/components/Table"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { UserDetail } from "./type"
import { convertDate } from "@/utils/moment"
import { limitPagination } from "@/utils/const"
import { Button } from "@/components/ui/button"
import { LuChevronLeft } from "react-icons/lu"
import { PATHS } from "@/routes/PATHS"
import { useNavigate } from "react-router-dom"

export function SignRequestDetail() {
    const {t} = useTranslation()

    const [page, setPage] = useState<number>(1)

    const navigate = useNavigate()

    const columnHelper = createColumnHelper<UserDetail>()
  const columns = useMemo<ColumnDef<UserDetail, any>[]>(
    () => [
      columnHelper.display({
        id: 'stt',
        cell: info => {
        //   return !isPreviousData
        //     ? info.row.index + page
        //     : info.row.index + pagePrev.current
        return info.row.index + page
        },
        header: () => <span>STT</span>,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('userName', {
        id: 'userName',
        header: () => <span>Tên tài khoản</span>,
        cell: info => info.row.original.userName,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('userEmail', {
        id: 'userEmail',
        header: () => <span>Email</span>,
        cell: info => info.row.original.userEmail,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('hasSigned', {
        id: 'hasSigned',
        header: () => <span>Trạng thái</span>,
        cell: info => {
            return info.row.original.hasSigned ? "Đã ký" : "Chưa ký"
        },
        footer: info => info.column.id,
      }),
      columnHelper.accessor('signTime', {
        id: 'signTime',
        header: () => <span>Ngày ký</span>,
        cell: info => convertDate(info.row.original.signTime),
        footer: info => info.column.id,
      }),
    ],
    [],
  )
    return (
        <div>
            <div className="flex items-center gap-4">
                <Button variant="outline" className="h-9" onClick={() => {navigate(PATHS.SIGN_REQUEST)}}>
                    <LuChevronLeft />
                    Quay lại
                </Button>
                <TitleBar title={t('sign_request:detail_page.title')} />
            </div>
            <div className="mt-4 bg-white rounded-lg p-6">
                <TitleBar title={t('sign_request:detail_page.request_info')} />
                <SignRequestDetailBox detail={signRequestDetail}/>
                <div className="mt-4">
                    <TitleBar title={t('sign_request:detail_page.user_list')} />
                    <BaseTable 
                        data={userList}
                        columns={columns}
                        isCheckbox={false}
                        offset={page * limitPagination}
                        setOffset={setPage}
                        total={userList.length}
                        isLoading={false}
                        isPreviousData={false}
                    />
                </div>
            </div>
        </div>
    )
}