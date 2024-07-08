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
import { useNavigate, useParams } from "react-router-dom"
import { useSignRequestInfo } from "./api/getSignRequestInfo"
import { useSignRequestStatus } from "./api/getSignRequestStatus"
import { useSignRequestUser } from "./api/getSignRequestUser"
import { useSignRequest } from "./api/signRequest"
import { useSignRequestGroup } from "./api/signRequestGroup"
import { Loading } from "@/components/Loading"
import { downloadFile } from "@/features/history"

export function SignRequestDetail() {
    const {t} = useTranslation()

    const params = useParams()

    const signRequestId = Number(params.requestId)

    const [page, setPage] = useState<number>(1)

    const navigate = useNavigate()

    const userId = Number(sessionStorage.getItem('userId'))

    const {
      data: getSignRequestInfoData,
      isLoading: isLoadingGetSignRequestInfo
    } = useSignRequestInfo({
      signRequestId: signRequestId
    })

    const {
      data: getSignRequestStatusData,
      isLoading: isLoadingGetSignRequestStatus
    } = useSignRequestStatus({
      signRequestId: signRequestId
    })

    const {
      data: getSignRequestUserData,
      isLoading: isLoadingGetSignRequestUser
    } = useSignRequestUser({
      signRequestId: signRequestId
    })

    const {
      mutateAsync: mutateSignRequest,
      isLoading: isLoadingSignRequest
    } = useSignRequest({})

    const {
      mutateAsync: mutateSignGroup,
      isLoading: isLoadingSignGroup
    } = useSignRequestGroup({})

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
      <>
      {(isLoadingSignRequest || isLoadingSignGroup) && <Loading />}
        <div>
            <div className="flex items-center gap-4">
                <Button variant="outline" className="h-9" onClick={() => {navigate(PATHS.SIGN_REQUEST)}}>
                    <LuChevronLeft />
                    Quay lại
                </Button>
                <TitleBar title={t('sign_request:detail_page.title')} />
            </div>
            <div className="mt-4 bg-white rounded-lg p-6">
              <div className="mb-4 flex items-center justify-between">
                <TitleBar title={t('sign_request:detail_page.request_info')} />
                <div className="flex items-center gap-4">
                  {getSignRequestInfoData && <Button variant="secondaryLight" onClick={() => downloadFile(
                    {fileId: getSignRequestInfoData.fileId,
                    fileName: getSignRequestInfoData.fileName
                    }
                  )}>
                    Tải file
                    </Button>}
                  {getSignRequestInfoData && getSignRequestInfoData.signedFileId && 
                    <Button variant="secondaryLight" onClick={() => downloadFile(
                      {fileId: getSignRequestInfoData.signedFileId,
                      fileName: getSignRequestInfoData.fileName
                      }
                    )}>Tải file đã kí</Button>}
                </div>
              </div>
                {getSignRequestInfoData && <SignRequestDetailBox detail={getSignRequestInfoData}/>}
                <div className="mt-4 flex items-center justify-center gap-4">
                  {getSignRequestStatusData?.status !== true && <Button variant="secondaryLight" onClick={() => {
                    mutateSignRequest({signRequestId: signRequestId})
                  }}>
                    Ký số
                  </Button>}
                  {getSignRequestInfoData?.ownerId === userId && 
                  getSignRequestInfoData.numMember === getSignRequestInfoData.numberOfUserHasSigned && 
                  <Button variant="secondaryLight" onClick={() => {
                    mutateSignGroup(
                      {
                        signRequestId: signRequestId,
                        signatureLocation: "test",
                        signatureReason: "test",
                        note: "test"
                      }
                    )
                  }}>
                    Ký nhóm
                  </Button>}
                </div>
                <div className="mt-4">
                    <TitleBar title={t('sign_request:detail_page.user_list')} />
                    <BaseTable 
                        data={getSignRequestUserData || []}
                        columns={columns}
                        isCheckbox={false}
                        offset={page * limitPagination}
                        setOffset={setPage}
                        total={getSignRequestUserData?.length}
                        isLoading={isLoadingGetSignRequestUser}
                        isPreviousData={false}
                    />
                </div>
            </div>
        </div>
        </>
    )
}