import TitleBar from "@/components/Head/TitleBar";
import { BaseTable } from "@/components/Table";
import { Button } from "@/components/ui/button";
import { useGetGroupUser } from "@/features/group/api/getGroupUser";
import { GroupUser } from "@/features/group/types";
import { PATHS } from "@/routes/PATHS";
import { limitPagination } from "@/utils/const";
import { convertDate } from "@/utils/moment";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuChevronLeft } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";

export function GroupDetail() {
    const {t} = useTranslation()

    const params = useParams()

    const groupId = Number(params.groupId)

    const navigate = useNavigate()

    const {
        data: groupUserData,
        isLoading: groupUserIsLoading
    } = useGetGroupUser({
        groupId: groupId
    })

    const [page, setPage] = useState<number>(1)

    const columnHelper = createColumnHelper<GroupUser>()
    const columns = useMemo<ColumnDef<GroupUser, any>[]>(
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
      columnHelper.accessor('phoneNumber', {
        id: 'phoneNumber',
        header: () => <span>Số điện thoại</span>,
        cell: info => info.row.original.phoneNumber,
        footer: info => info.column.id,
      }),
      columnHelper.accessor('joinDate', {
        id: 'joinDate',
        header: () => <span>Ngày tham gia</span>,
        cell: info => convertDate(info.row.original.joinDate),
        footer: info => info.column.id,
      }),
    ],
    [],
  )
    return (
        <div>
            <div className="flex items-center gap-4">
                <Button variant="outline" className="h-9" onClick={() => {navigate(PATHS.GROUP)}}>
                    <LuChevronLeft />
                    Quay lại
                </Button>
                <TitleBar title={t('group:detail.title')} />
            </div>
            <div className="mt-4 bg-white rounded-lg p-6">
                    <TitleBar title={t('group:detail.user_list')} />
                    <BaseTable 
                        data={groupUserData || []}
                        columns={columns}
                        isCheckbox={false}
                        offset={page * limitPagination}
                        setOffset={setPage}
                        total={groupUserData?.length}
                        isLoading={groupUserIsLoading}
                        isPreviousData={false}
                    />
            </div>
        </div>
    )
}