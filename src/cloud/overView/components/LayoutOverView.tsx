import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'

import {
  ArrowTopRightIcon,
  AvatarIcon,
  CheckCircledIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  RadiobuttonIcon,
  TimerIcon,
} from '@radix-ui/react-icons'
import clsx from 'clsx'
import { type ReactElement, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import thietbiIcon from '@/assets/icons/sb-thietbi.svg'
import AssetManagement from '@/assets/images/SolutionMaketplace/AssetManagement.png'
import SmartFarming from '@/assets/images/SolutionMaketplace/SmartFarming.png'
import SmartHome from '@/assets/images/SolutionMaketplace/SmartHome.png'
import SmartMetering from '@/assets/images/SolutionMaketplace/SmartMetering.png'
import SmartTracking from '@/assets/images/SolutionMaketplace/SmartTracking.png'
import { useGetDashboards, type DashboardRes } from '@/cloud/dashboard/api'
import { useRestoreProject } from '@/cloud/project/api/restoreProject'
import { Button } from '@/components/ui/button'

import { Link } from '@/components/Link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PATHS } from '@/routes/PATHS'
import { cn } from '@/utils/misc'
import storage from '@/utils/storage'
import { useGetConnectedDevices } from '../api'
import { useGetConcurrentUser } from '../api/getConcurrentUser'
import { useGetRegistedUser } from '../api/getRegistedUser'
import { useRequestHandlingTime } from '../api/requestHandlingTime'
import { useSuccessRate } from '../api/successRate'
import assetManagementData from '../assetManagement.json'
import fleetManagementData from '../fleetManagement.json'
import smartFarmData from '../smartFarm.json'
import smartHomeData from '../smartHome.json'
import smartWaterData from '../smartWater.json'
import { DashboardTable } from './DashboardTable'
import { useDisclosure } from '@/utils/hooks'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export function LayoutOverView() {
  const { t } = useTranslation()
  const projectId = storage.getProject()?.id
  const navigate = useNavigate()

  const [type, setType] = useState('Last viewed')
  const [lastView, setLastView] = useState<DashboardRes[] | null>()
  const [starred, setStarred] = useState<DashboardRes[] | null>()
  const [offset, setOffset] = useState(0)
  const [backupData, setBackupData] = useState({})
  const [bodyContent, setBodyContent] = useState<ReactElement>()
  const { close, open, isOpen } = useDisclosure()

  const dashboardType = ['Last viewed', 'Starred']

  const sampleDivices = [
    {
      title: i18n.t('title:fleet_management'),
      img: SmartTracking,
      content: i18n.t('document:fleet_management.content'),
      content2: i18n.t('document:fleet_management.content2'),
      content3: i18n.t('document:fleet_management.content3'),
      content4: i18n.t('document:fleet_management.content4'),
      content5: i18n.t('document:fleet_management.content5'),
      jsonData: fleetManagementData,
    },
    {
      title: i18n.t('title:asset_management'),
      img: AssetManagement,
      content: i18n.t('document:asset_management.content'),
      content2: i18n.t('document:asset_management.content2'),
      content3: i18n.t('document:asset_management.content3'),
      content4: i18n.t('document:asset_management.content4'),
      content5: i18n.t('document:asset_management.content5'),
      jsonData: assetManagementData,
    },
    {
      title: i18n.t('title:smart_water_meter'),
      img: SmartMetering,
      content:
        'Giải pháp đồng hồ nước thông mình giúp bạn theo dõi lưu lượng sử dụng, cảnh bảo về các vấn đề liên quan đến đường dẫn nước trong nhà bạn, dẫn đến giảm chi phí, giải thiếu các rủi ro. Giải pháp đồng hồ nước thông minh cung cấp hệ thông đo lường từ xa và tổng hợp lại số lượng đã sử dụng mà không cần đội ngũ đến kiểm tra.',
      content2: 'Chức năng chính:',
      content3: '- Đo lượng tổng lượng nước tiêu thụ',
      content4: '- Cảnh báo về sự cố đường nước qua SMS hoặc App notification',
      content5: '- Đo tốc độ dòng chảy của nước',
      jsonData: smartWaterData,
    },
    {
      title: i18n.t('title:smart_farm'),
      img: SmartFarming,
      content:
        'Giải pháp nông nghiệp thông minh giúp bạn theo dõi lưu lượng sử dụng, cảnh báo về các vấn đề liên quan độ ẩm cho vườn cây nhà bạn, giảm thiếu các rủi ro.',
      content2: 'Chức năng chính:',
      content3: '- Do độ ẩm hiện tại để bật/tắt máy bơm nước',
      content4: '- Do tổng lượng nước đã tiêu thụ',
      content5: '',
      jsonData: smartFarmData,
    },
    {
      title: i18n.t('title:smart_home'),
      img: SmartHome,
      content:
        'Giải pháp hỗ trợ các ngữ cảnh thông minh được đặt theo giờ hoặc theo ngoại cảnh để người sử dụng có trải nghiệm và sức khỏe tinh thần tốt nhất trong căn nhà.',
      content2: '',
      content3: '',
      content4: '',
      content5: '',
      jsonData: smartHomeData,
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
      content: t('sidebar:integration.ai.title'),
      link: `${PATHS.AI}`,
    },
  ]

  const tab1 = sampleDivices.slice(0, 3)
  const tab2 = sampleDivices.slice(3, 5)

  const {
    mutateAsync: mutateAsyncUploadProjectFile,
    isLoading: isLoadingProject,
    isSuccess: isSuccessProject,
  } = useRestoreProject({
    type: 'overView',
  })

  useEffect(() => {
    if (isSuccessProject) {
      close()
    }
  }, [isSuccessProject])

  const { data: dashboardData, isPreviousData } = useGetDashboards({
    projectId,
  })
  const { data: connectedDevicesData } = useGetConnectedDevices({ projectId })
  const { data: registedUserData } = useGetRegistedUser({ projectId })
  const { data: concurrentUserData } = useGetConcurrentUser({ projectId })
  const { mutate: mutateRequestHandlingTime, data: RequestHandlingTimeData } =
    useRequestHandlingTime()
  const { mutate: mutateSuccessRate, data: SuccessRateData } = useSuccessRate()

  useEffect(() => {
    mutateRequestHandlingTime({
      projectId,
      method: 'POST',
      url: 'devices',
    })
    mutateSuccessRate({
      projectId,
      method: 'POST',
      url: 'devices',
    })
  }, [])

  useEffect(() => {
    const lastViewFilter = dashboardData?.dashboard?.filter(
      item => item?.dashboard_setting?.last_viewed,
    )
    const starredFilter = dashboardData?.dashboard?.filter(
      item => item?.dashboard_setting?.starred,
    )
    setLastView(lastViewFilter)
    setStarred(starredFilter)
  }, [dashboardData])

  return (
    <>
      <div className="py-4">
        <div className="grid w-full grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-5">
          <div className="rounded-md border border-solid border-[#ccc] bg-white p-4">
            <p className="text-table-header">{t('overView:total_devices')}</p>
            <div className="mt-2 flex justify-between">
              <span>{connectedDevicesData?.total}</span>
              <img
                src={thietbiIcon}
                alt="Overview"
                className="aspect-square w-[20px]"
              />
            </div>
          </div>
          <div className="rounded-md border border-solid border-[#ccc] bg-white p-4">
            <p className="text-table-header">{t('overView:total_user')}</p>
            <div className="mt-2 flex justify-between">
              <span>{registedUserData?.total}</span>
              <AvatarIcon className="h-5 w-5 text-primary-400" />
            </div>
          </div>
          <div className="rounded-md border border-solid border-[#ccc] bg-white p-4">
            <p className="text-table-header">
              {t('overView:total_user_online')}
            </p>
            <div className="mt-2 flex justify-between">
              <span>{concurrentUserData?.total}</span>
              <RadiobuttonIcon className="h-5 w-5 text-primary-400" />
            </div>
          </div>
          <div className="rounded-md border border-solid border-[#ccc] bg-white p-4">
            <p className="text-table-header">{t('overView:request_time')}</p>
            <div className="mt-2 flex justify-between">
              <span>{RequestHandlingTimeData?.avg_latency}</span>
              <TimerIcon className="h-5 w-5 text-primary-400" />
            </div>
          </div>
          <div className="rounded-md border border-solid border-[#ccc] bg-white p-4">
            <p className="text-table-header">{t('overView:success_rate')}</p>
            <div className="mt-2 flex justify-between">
              <span>{SuccessRateData?.success_rate}</span>
              <CheckCircledIcon className="h-5 w-5 text-primary-400" />
            </div>
          </div>
        </div>
      </div>
      <div>
        <Tabs defaultValue="tab1">
          <TabsList className="flex justify-end gap-x-2 bg-secondary-500 px-10">
            <TabsTrigger value="tab1">
              <div className="flex items-center gap-x-2">
                <ChevronLeftIcon className="h-5 w-5" />
              </div>
            </TabsTrigger>
            <TabsTrigger value="tab2">
              <div className="flex items-center gap-x-2">
                <ChevronRightIcon className="h-5 w-5" />
              </div>
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="tab1"
            className={clsx(
              'flex grow flex-col bg-secondary-500 px-9 py-3 shadow-lg',
            )}
          >
            <div className="grid w-full grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-3">
              {tab1?.map(item => {
                return (
                  <div
                    key={item.title}
                    className="relative flex flex-col break-words rounded-md bg-secondary-500 shadow-sm"
                  >
                    <div className="alignItemCenter">
                      <img src={item.img} alt="" width="100%" height="300" />
                    </div>
                    <div className="text p-3">
                      <h4 className="mt-3 text-table-header">{item.title}</h4>
                      <p className="mb-2 mt-3 line-clamp-3">
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
                        onClick={() => {
                          setBackupData(item.jsonData)
                          setBodyContent(
                            <span>
                              {t('overView:setup_confirm').replace(
                                '{{TITLE}}',
                                item.title,
                              )}
                              <p className="mb-2 mt-3">
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
                            </span>,
                          )
                          open()
                        }}
                        className="border-none bg-primary-400"
                      >
                        {t('btn:setup')}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>
          <TabsContent
            value="tab2"
            className={clsx(
              'flex grow flex-col bg-secondary-500 px-9 py-3 shadow-lg',
            )}
          >
            <div className="grid w-full grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-3">
              {tab2?.map(item => {
                return (
                  <div
                    key={item.title}
                    className="relative flex flex-col break-words rounded-md bg-secondary-500 shadow-sm"
                  >
                    <div className="alignItemCenter">
                      <img src={item.img} alt="" width="100%" height="300" />
                    </div>
                    <div className="text p-3">
                      <h4 className="mt-3 text-table-header">{item.title}</h4>
                      <p className="mb-2 mt-3 line-clamp-3">
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
                        onClick={() => {
                          setBackupData(item.jsonData)
                          setBodyContent(
                            <span>
                              {t('overView:setup_confirm').replace(
                                '{{TITLE}}',
                                item.title,
                              )}
                              <p className="mb-2 mt-3">
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
                            </span>,
                          )
                          open()
                        }}
                        className="border-none bg-primary-400"
                      >
                        {t('btn:setup')}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <div className="mt-3 grid w-full grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2 ">
        <div className="max-h-[26vh] overflow-auto rounded-md bg-secondary-500 p-2">
          <div className="flex h-[50px] w-full justify-between gap-2 py-2">
            <div
              className="flex cursor-pointer items-center gap-3"
              onClick={() => navigate(`${PATHS.DASHBOARD}/${projectId}`)}
            >
              <p className="text-table-header">{t('overView:dashboard')}</p>
              <ArrowTopRightIcon className="h-5 w-5" />
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
                        'bg-primary-400 rounded-2xl text-white': type === item,
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
                {t('overView:add_dashboard')}
              </Button>
            </div>
          </div>
          {type === 'Last viewed' ? (
            <DashboardTable
              data={lastView ?? []}
              offset={offset}
              setOffset={setOffset}
              total={0}
              isPreviousData={isPreviousData}
            />
          ) : (
            <DashboardTable
              data={starred ?? []}
              offset={offset}
              setOffset={setOffset}
              total={0}
              isPreviousData={isPreviousData}
            />
          )}
        </div>
        <div className="max-h-[26vh] overflow-auto rounded-md bg-secondary-500 px-2 py-4">
          <div className="mb-3 flex cursor-pointer items-center gap-3">
            <p className="text-table-header">{t('overView:quick_link')}</p>
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
      <ConfirmDialog
        icon="danger"
        title={t('btn:setup')}
        body={bodyContent}
        close={close}
        isOpen={isOpen}
        isSuccessDelete={isSuccessProject}
        handleSubmit={() =>
          mutateAsyncUploadProjectFile({
            projectId,
            backup: {
              backup: backupData,
            },
          })
        }
        isLoading={isLoadingProject}
      />
    </>
  )
}
