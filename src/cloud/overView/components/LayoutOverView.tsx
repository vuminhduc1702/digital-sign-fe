import { useTranslation } from 'react-i18next'

import { useNavigate } from 'react-router-dom'
import AssetManagement from '~/assets/images/SolutionMaketplace/AssetManagement.png'
import SmartFarming from '~/assets/images/SolutionMaketplace/SmartFarming.png'
import SmartHome from '~/assets/images/SolutionMaketplace/SmartHome.png'
import SmartMetering from '~/assets/images/SolutionMaketplace/SmartMetering.png'
import SmartTracking from '~/assets/images/SolutionMaketplace/SmartTracking.png'
import { useState } from 'react'
import { cn } from '~/utils/misc'
import { Button } from '~/components/Button'
import storage from '~/utils/storage'
import { PATHS } from '~/routes/PATHS'
import { Link } from '~/components/Link'
import { useGetDashboards } from '~/cloud/dashboard/api'
import { useGetConnectedDevices } from '../api'
import { useGetRegistedUser } from '../api/getRegistedUser'
import { useGetConcurrentUser } from '../api/getConcurrentUser'

export function LayoutOverView() {
  const { t } = useTranslation()
  const { id: projectId } = storage.getProject()
  const navigate = useNavigate()

  const [type, setType] = useState('Last viewed')

  const dashboardType = ['Last viewed', 'Starred']

  const arr = [
    {
      title: 'Giải pháp Fleet Management',
      img: SmartTracking,
      content:
        'Giải pháp quản lý đội xe giúp bạn quản lý hoạt động của đội xe, dẫn đến giảm chi phí, cải thiện hiệu quả và nâng cao tính tuân thủ. Giải pháp quản lý đội xe phù hợp có thể là công cụ trong việc điều phối các hoạt động quản lý đội xe của bạn.',
      content2: 'Chức năng chính:',
      content3: '- Cảnh báo vùng an toàn qua SMS hoặc App Notification',
      content4: '- Cảnh báo pin yếu qua SMS hoặc App Notification',
      content5: '- Định vị được vị trí qua bản tin thiết bị bắn lên',
    },
    {
      title: 'Giải pháp Asset Management',
      img: AssetManagement,
      content:
        'Giải pháp quản lý tài sản giúp bạn theo dõi tài sản thông qua việc sử dụng các thẻ RFID được gắn vào chúng. Các thẻ được đọc bằng máy quét cố định được gắn ở vị trí cố đinh. Mỗi khi một thẻ được đọc, nó sẽ được lưu tổng hợp thành một chuỗi và bán tổng tất cả các RFID đã quét được lên hệ thống. Bên cạnh đó, giải pháp còn cảnh báo cho bạn những RFID bị thiếu hoặc RFID lạ để giúp bạn tránh bị thiếu sót tài sản',
      content2: 'Chức năng chính:',
      content3:
        '- Cảnh báo RFID bị thiếu, RFID lạ qua SMS hoặc App Notification',
      content4:
        '- Xử lý tập bản tin thiết bị gửi lên (gộp bản tin, kiểm tra trùng)',
      content5: '- Đăng ký RFID mới theo danh sách hoặc chỉnh sửa số lượng nhỏ',
    },
    {
      title: 'Giải pháp Smart Water Meter',
      img: SmartMetering,
      content:
        'Giải pháp đồng hồ nước thông mình giúp bạn theo dõi lưu lượng sử dụng, cảnh bảo về các vấn đề liên quan đến đường dẫn nước trong nhà bạn, dẫn đến giảm chi phí, giải thiếu các rủi ro. Giải pháp đồng hồ nước thông minh cung cấp hệ thông đo lường từ xa và tổng hợp lại số lượng đã sử dụng mà không cần đội ngũ đến kiểm tra.',
      content2: 'Chức năng chính:',
      content3: '- Đo lượng tổng lượng nước tiêu thụ',
      content4: '- Cảnh báo về sự cố đường nước qua SMS hoặc App notification',
      content5: '- Đo tốc độ dòng chảy của nước',
    },
    {
      title: 'Giải pháp Smart Farm',
      img: SmartFarming,
      content:
        'Giải pháp nông nghiệp thông minh giúp bạn theo dõi lưu lượng sử dụng, cảnh báo về các vấn đề liên quan độ ẩm cho vườn cây nhà bạn, giảm thiếu các rủi ro.',
      content2: 'Chức năng chính:',
      content3: '- Do độ ẩm hiện tại để bật/tắt máy bơm nước',
      content4: '- Do tổng lượng nước đã tiêu thụ',
      content5: '',
    },
    {
      title: 'Giải pháp Smarthome',
      img: SmartHome,
      content:
        'Giải pháp hỗ trợ các ngữ cảnh thông minh được đặt theo giờ hoặc theo ngoại cảnh để người sử dụng có trải nghiệm và sức khỏe tinh thần tốt nhất trong căn nhà',
      content2: '',
      content3: '',
      content4: '',
      content5: '',
    },
  ]

  const quickLink = [
    {
      content: t('sidebar:device.devkit'),
      link: `${PATHS.DEVKIT}`,
    },
    {
      content: t('sidebar:device.module'),
      link: `${PATHS.MODULE}`,
    },
    {
      content: t('sidebar:cloud.org_management'),
      link: `${PATHS.ORG}`,
    },
    {
      content: t('sidebar:cloud.flow_engine_v2'),
      link: `${PATHS.THING_TEMPLATE}/${projectId}`,
    },
    {
      content: t('sidebar:cloud.firm_ware'),
      link: `${PATHS.FIRM_WARE}/${projectId}`,
    },
    {
      content: t('sidebar:cloud.device_template'),
      link: `${PATHS.DEVICE_TEMPLATE}/${projectId}`,
    },
    {
      content: t('sidebar:cloud.flow_engine'),
      link: `${PATHS.FLOW_ENGINE}/${projectId}`,
    },
    {
      content: t('sidebar:cloud.dashboard'),
      link: `${PATHS.DASHBOARD}/${projectId}`,
    },
    {
      content: t('sidebar:cloud.role_manage'),
      link: `${PATHS.ROLE_MANAGE}/${projectId}`,
    },
    {
      content: t('sidebar:cloud.custom_protocol'),
      link: `${PATHS.CUSTOM_PROTOCOL}/${projectId}`,
    },
    {
      content: t('sidebar:application.appsdk'),
      link: `${PATHS.APPSDK}`,
    },
    {
      content: t('sidebar:application.vsmart_debug'),
      link: `${PATHS.APPDEBUG}`,
    },
    {
      content: t('sidebar:payment.plgc'),
      link: `${PATHS.BILLING_PACKAGE}/${projectId}`,
    },
    {
      content: t('sidebar:payment.plkh'),
      link: `${PATHS.CUSTOMER_MANAGE}/${projectId}`,
    },
    {
      content: t('sidebar:payment.pldk'),
      link: `${PATHS.BILLING_SUBSCRIPTION}/${projectId}`,
    },
    {
      content: t('sidebar:payment.plhd'),
      link: `${PATHS.BILLING}/${projectId}`,
    },
    {
      content: t('sidebar:intergration.ai'),
      link: `${PATHS.AI}`,
    },
  ]

  const { data: dashboardData } = useGetDashboards({ projectId })
  const { data: connectedDevicesData } = useGetConnectedDevices({ projectId })
  const { data: registedUserData } = useGetRegistedUser({ projectId })
  const { data: concurrentUserData } = useGetConcurrentUser({ projectId })

  console.log(
    connectedDevicesData,
    registedUserData,
    concurrentUserData,
    'dashboardDatadashboardDatadashboardDatadashboardData',
  )

  return (
    <>
      <div className="py-4">
        <div className="grid w-full grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-5">
          <div className="rounded-md border border-solid border-[#ccc] bg-white p-4">
            <p className="text-table-header">Tổng số thiết bị</p>
          </div>
          <div className="rounded-md border border-solid border-[#ccc] bg-white p-4">
            <p className="text-table-header">Tổng số người dùng</p>
          </div>
          <div className="rounded-md border border-solid border-[#ccc] bg-white p-4">
            <p className="text-table-header">Tổng số user online</p>
          </div>
          <div className="rounded-md border border-solid border-[#ccc] bg-white p-4">
            <p className="text-table-header">Thời gian request trung bình</p>
          </div>
          <div className="rounded-md border border-solid border-[#ccc] bg-white p-4">
            <p className="text-table-header">Tỉ lệ thành công</p>
          </div>
        </div>
      </div>
      <div className="flex max-h-[50vh] justify-between overflow-auto rounded-md bg-secondary-500 px-4 py-6">
        <div className="grid w-full grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-3"> 
          {arr?.map(item => {
            return (
              <div
                key={item.title}
                className="relative flex flex-col break-words rounded-md bg-secondary-500 shadow-sm"
              >
                <div className="alignItemCenter">
                  <img src={item.img} alt="" width="100%" height="300" />
                </div>
                <div className="text mt-3 p-3">
                  <div className="flex justify-between">
                    <div>
                      <i className="bx bx-user"></i> InnoWay
                    </div>
                    <div>
                      <i className="bx bx-calendar"></i> 01/06/2022
                    </div>
                  </div>
                  <h4 className="mt-3 text-table-header">{item.title}</h4>
                  <p className="mt-3 line-clamp-3 cursor-pointer hover:block">
                    {item.content}
                    {item.content2 && <br />}
                    {item.content2}
                    {item.content3 && <br />}
                    {item.content3}
                    {item.content4 && <br />}
                    {item.content4}
                    {item.content5 && <br />}
                    {item.content5}
                  </p>
                  <Button
                    type="button"
                    size="square"
                    className="border-none bg-primary-400"
                  >
                    Cài đặt
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-4 grid w-full grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2 ">
        <div className="max-h-[30vh] overflow-auto rounded-md bg-secondary-500 px-2 py-4">
          <div className="flex h-[50px] w-full justify-between gap-2 py-2">
            <div
              className="flex cursor-pointer items-center gap-3"
              onClick={() => navigate(`${PATHS.DASHBOARD}/${projectId}`)}
            >
              <p className="text-table-header">Dashboard</p>
            </div>
            <div className="flex ">
              <div className="w-fit rounded-2xl bg-slate-200">
                {dashboardType.map(item => {
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setType(item)
                      }}
                      className={cn('px-4 py-2 text-slate-400', {
                        'rounded-2xl bg-primary-400 text-white': type === item,
                      })}
                    >
                      {item}
                    </button>
                  )
                })}
              </div>
              <Button
                type="button"
                size="square"
                onClick={() =>
                  navigate(`${PATHS.DASHBOARD}/${projectId}?openDrawer=true`)
                }
                className="ml-3 border-none bg-primary-400"
              >
                Add dashboard
              </Button>
            </div>
          </div>
          {type === 'Last viewed' ? <div>Hahahahaha</div> : <div>Heeee</div>}
        </div>
        <div className="max-h-[25vh] overflow-auto rounded-md bg-secondary-500 px-2 py-4">
          <div className="mb-3 flex cursor-pointer items-center gap-3">
            <p className="text-table-header">Quick Link</p>
          </div>
          <div className="grid w-full grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-3">
            {quickLink?.map(item => {
              return (
                <Link
                  className="flex rounded-md border border-solid border-[#ccc] bg-white py-3"
                  to={item.link}
                  key={item.content}
                >
                  <div className="pl-4">{item.content}</div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
