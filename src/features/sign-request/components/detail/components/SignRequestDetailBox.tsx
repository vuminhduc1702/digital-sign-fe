import { convertDate } from "@/utils/moment";
import { useTranslation } from "react-i18next";
import { SignRequestDetailType } from "../type";

type SignRequestDetailBoxProps = {
    detail: SignRequestDetailType
}

export function SignRequestDetailBox({detail}: SignRequestDetailBoxProps) {
    const {t} = useTranslation()
    return (
     <div className="grid grid-flow-col grid-rows-5 gap-3 rounded-lg bg-secondary-400 p-4 mb-4">
      <div className="grid grid-cols-3">
        <p>Tên file:</p>
        <p className="col-span-2 font-semibold">{detail.fileName}</p>
      </div>
      <div className="grid grid-cols-3">
        <p>Kích thước:</p>
        <p className="col-span-2 font-semibold">{detail.fileSize}</p>
      </div>
      <div className="grid grid-cols-3">
        <p>Người tạo:</p>
        <p className="col-span-2 font-semibold">{detail.registUserName}</p>      
      </div>
      <div className="grid grid-cols-3">
        <p>Người cập nhật gần nhất:</p>
        <p className="col-span-2 font-semibold">{detail.updateUserName}</p>
      </div>
      <div className="grid grid-cols-3">
        <p>Ngày tạo:</p>
        <p className="col-span-2 font-semibold">{convertDate(detail.registTs)}</p>
      </div>
      <div className="grid grid-cols-3">
        <p>Ngày cập nhật gần nhất:</p>
        <p className="col-span-2 font-semibold">{convertDate(detail.updateTs)}</p>
      </div>
      <div className="grid grid-cols-3">
        <p>Số lượng người cần ký:</p>
        <p className="col-span-2 font-semibold">{detail.numberOfUser}</p>
      </div>
      <div className="grid grid-cols-3">
        <p>Số lượng người đã ký:</p>
        <p className="col-span-2 font-semibold">{detail.numberOfUserHasSigned}</p>
      </div>
      <div className="grid grid-cols-3">
        <p>Hạn ký:</p>
        <p className="col-span-2 font-semibold">{convertDate(detail.invalidDate)}</p>
      </div>
    </div>
    )
}