import { type MapInfo } from '../types'

export default function ItemInfo(mapInfo: MapInfo) {
  return (
    <div>
      <div>
        <div>{mapInfo.name}</div>
        <div>Số hiệu: {mapInfo.serial}</div>
        <div>Tài khoản quản lý: ...</div>
      </div>
      <div className="bg-grey-100">
        <div>Loại thiết bị: đèn</div>
        <div>Công nghệ: NB IoT</div>
        <div>Trạng thái: {mapInfo.attributes?.status_lamp}</div>
        <div>Chế độ hoạt động: {mapInfo.attributes?.status_gw}</div>
        <div>Cảnh báo: Dòng điện cao</div>
        <div>Vị trí: ...</div>
        <div>Latitude: {mapInfo.attributes?.latitude_gw}</div>
        <div>Longitude: {mapInfo.attributes?.longitude_gw}</div>
        <div>Bộ điều khiển: DQSmart</div>
        <div>Phiên bản bộ điều khiển: 1.0.1</div>
      </div>
    </div>
  )
}
