import { BaseTable } from "@/components/Table";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Group } from "../types";
import { convertDate } from "@/utils/moment";
import { useNavigate } from "react-router-dom";
import { LuEye, LuPlus } from "react-icons/lu";
import { PATHS } from "@/routes/PATHS";
import { useGetGroupList } from "../api/getGroupList";
import { Button } from "@/components/ui/button";
import { useDisclosure } from "@/utils/hooks";
import { CreateGroup } from "./CreateGroup";

function GroupTableContext({groupId}: {groupId: number}) {
    const navigate = useNavigate()
    return (
        <>
            <div className="flex">
                <div className="flex cursor-pointer justify-center p-3">
                    <LuEye 
                        className="text-lg text-secondary-800 transition-all duration-200 ease-in-out hover:scale-125 hover:text-black"
                        onClick={() => {
                            navigate(`${PATHS.GROUP}/${groupId}`)
                        }}
                    />
                </div>
            </div>
        </>
    )
}

export function GroupTable() {
    const {t} = useTranslation()

    const [page, setPage] = useState<number>(1)

    const form = useForm()

    const {control, setValue, getValues, watch} = form

    const {
        close: closeCreateGroup,
        isOpen: isOpenCreateGroup,
        open: openCreateGroup
    } = useDisclosure()

    const {
        data: groupData,
        isLoading: groupIsLoading,
        isPreviousData: groupIsPreviousData
    } = useGetGroupList({
        pageNum: page
    })

    const columnHelper = createColumnHelper<Group>()
    const columns = useMemo<ColumnDef<Group, any>[]>(
        () => [
            columnHelper.display({
                id: 'stt',
                cell: info => {
                  return info.row.index + page
                //   !isPreviousData
                //     ? info.row.index + page
                //     : info.row.index + pagePrev.current
                },
                header: () => <span>{t('group:stt')}</span>,
                footer: info => info.column.id,
              }),
              columnHelper.accessor('groupName', {
                id: 'groupName',
                header: () => <span>{t('group:name')}</span>,
                cell: info => info.row.original.groupName,
                footer: info => info.column.id,
              }),
              columnHelper.accessor('ownerName', {
                id: 'ownerName',
                header: () => <span>{t('group:owner')}</span>,
                cell: info => info.row.original.ownerName,
                footer: info => info.column.id,
              }),
              columnHelper.accessor('numMember', {
                id: 'numMember',
                header: () => <span>{t('group:num_member')}</span>,
                cell: info => info.row.original.numMember,
                footer: info => info.column.id,
              }),
              columnHelper.accessor('registTs', {
                id: 'registTs',
                header: () => <span>{t('group:regist_ts')}</span>,
                cell: info => convertDate(info.row.original.registTs),
                footer: info => info.column.id,
              }),
              columnHelper.accessor('joinDate', {
                id: 'joinDate',
                header: () => <span>{t('group:join_date')}</span>,
                cell: info => convertDate(info.row.original.joinDate),
                footer: info => info.column.id,
              }),
              columnHelper.display({
                id: 'action',
                header: () => <span>{t('group:action')}</span>,
                cell: info => {
                    const {groupId} = info.row.original
                  return GroupTableContext({ groupId: groupId })
                },
                footer: info => info.column.id,
              }),
        ],
        []
    )

    return (
        <div className="bg-white p-6 rounded-lg">
            <div className="my-4 flex justify-end">
                <Button className="h-9" startIcon={<LuPlus className="w-4 h-4"/>} onClick={openCreateGroup}>
                    {t('group:create_group')}
                </Button>
            </div>
            <div className="mt-4">
            <BaseTable 
                data={groupData?.data || []}
                columns={columns}
                isCheckbox={false}
                offset={page}
                setOffset={setPage}
                total={groupData?.meta.total || groupData?.data?.length}
                isLoading={groupIsLoading}
                isPreviousData={groupIsPreviousData}
            />
            </div>
            {isOpenCreateGroup && <CreateGroup isOpen={isOpenCreateGroup} close={closeCreateGroup} />}
        </div>
    )
}