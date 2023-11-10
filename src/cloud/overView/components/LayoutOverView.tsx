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
      content: "Giải pháp quản lý đội xe giúp bạn quản lý hoạt động của đội xe, dẫn đến giảm chi phí, cải thiện hiệu quả và nâng cao tính tuân thủ. Giải pháp quản lý đội xe phù hợp có thể là công cụ trong việc điều phối các hoạt động quản lý đội xe của bạn. <br>Chức năng chính: <br>- Cảnh báo vùng an toàn qua SMS hoặc App Notification <br>- Cảnh báo pin yếu qua SMS hoặc App Notification<br>- Định vị được vị trí qua bản tin thiết bị bắn lên"
    },
    {
      title: 'Giải pháp Asset Management',
      img: AssetManagement,
    },
    {
      title: 'Giải pháp Smart Water Meter',
      img: SmartMetering,
    },
    {
      title: 'Giải pháp Smart Farm',
      img: SmartFarming,
    },
    {
      title: 'Giải pháp Smarthome',
      img: SmartHome,
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

  console.log(
    dashboardData,
    'dashboardDatadashboardDatadashboardDatadashboardData',
  )

  return (
    <>
      <div className="flex justify-between rounded-md bg-secondary-500 px-2 py-4">
        <div className="grid w-full grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-5">
          {arr?.map(item => {
            return (
              <div className="relative flex flex-col break-words rounded-md bg-secondary-500 shadow-sm">
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
                  <h4 className="mt-3">{item.title}</h4>
                  <p>{item.content}</p>
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
      <div className="flex justify-between rounded-md bg-secondary-500 px-2 py-4">
        <div className="grid w-full grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-5">
          {arr?.map(item => {
            return (
              <div className="relative flex flex-col break-words rounded-md bg-secondary-500 shadow-sm">
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
                  <h4 className="mt-3">{item.title}</h4>
                  
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="grid w-full grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
        <div className="rounded-md bg-secondary-500 px-2 py-4">
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
        <div className="rounded-md bg-secondary-500 px-2 py-4">
          <div className="mb-3 flex cursor-pointer items-center gap-3">
            <p className="text-table-header">Quick Link</p>
          </div>
          <div className="grid w-full grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-3">
            {quickLink?.map(item => {
              return (
                <Link
                  className="flex rounded-md border border-solid border-[#ccc] bg-white py-3"
                  to={item.link}
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
