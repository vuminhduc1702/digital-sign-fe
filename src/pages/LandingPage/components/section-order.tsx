import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SectionOrderBG from '~/assets/images/landingpage/BG_sectionorder.png'
import { Button } from '~/components/Button'
import { PATHS } from '~/routes/PATHS'
import {
  ArrowRightUpLine,
  CheckboxCircleLineWhite,
} from '~/components/SVGIcons'
import { useTranslation } from 'react-i18next'
import storage from '~/utils/storage'

export function SectionOrder() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  return (
    <>
      <div className="h-[100px]"></div>
      <div className="h-[559px] bg-[#EA0033]">
        <div
          className="flex h-full w-full items-center justify-center bg-no-repeat p-20 opacity-100"
          style={{ backgroundImage: `url(${SectionOrderBG})` }}
        >
          <div className="flex h-full w-[992px]">
            <div className="w-1/2">
              <iframe
                src="https://www.youtube.com/embed/KvNhWGB5nuk?rel=1&controls=1&showinfo=0&start=1&autoplay=0&enablejsapi=1"
                className="h-full w-[496px] rounded-lg"
              ></iframe>
            </div>
            <div className="ml-10 ">
              <div className="w-[373px] text-[35px] leading-[43px] text-white">
                {t('landingpage:order.manage_platform')}
              </div>
              {/* <div className="pt-5 text-[16px] leading-[20.8px] text-white">
                Hệ thống Cloud Innoway của Viettel cho phép các nhà tích hợp hệ
                thống triển khai tích hợp các giải pháp quản lý điều khiển thiết
                bị một cách hiệu quả
              </div>
              <div className="flex h-fit pt-[20px]">
                <div className="h-fit w-1/2">
                  <div className="mb-[-8px] h-[55px] border-b">
                    <CheckboxCircleLineWhite
                      width={25}
                      height={25}
                      viewBox="0 0 25 25"
                    ></CheckboxCircleLineWhite>
                    <p className="relative top-[-25px] pl-[30px] text-[16px] leading-[20.8px] text-white">
                      {t('landingpage:order.manage_device')}
                    </p>
                  </div>
                  <div className="mb-[-8px] h-[55px] pt-4">
                    <CheckboxCircleLineWhite
                      width={24}
                      height={25}
                      viewBox="0 0 24 25"
                    ></CheckboxCircleLineWhite>
                    <p className="relative top-[-25px] pl-[30px] text-[16px] leading-[20.8px] text-white">
                      {t('landingpage:order.business_model')}
                    </p>
                  </div>
                </div>
                <div className="ml-4 h-fit w-1/2">
                  <div className="mb-[-8px] h-[55px] border-b">
                    <CheckboxCircleLineWhite
                      width={25}
                      height={25}
                      viewBox="0 0 25 25"
                    ></CheckboxCircleLineWhite>
                    <p className="relative top-[-25px] pl-[30px] text-[16px] leading-[20.8px] text-white">
                      {t('landingpage:order.data_security')}
                    </p>
                  </div>
                  <div className="mb-[-8px] h-[55px] pt-4">
                    <CheckboxCircleLineWhite
                      width={24}
                      height={25}
                      viewBox="0 0 24 25"
                    ></CheckboxCircleLineWhite>
                    <p className="relative top-[-25px] pl-[30px] text-[16px] leading-[20.8px] text-white">
                      {t('landingpage:order.support_protocol')}
                    </p>
                  </div>
                </div>
              </div> */}
              <div className="pt-5 text-[16px] leading-[16.8px] text-white">
                Nền tảng của chúng tôi đã hỗ trợ rút ngắn thời gian phát triển
                các giải pháp IoT của Viettel tới 70%. Tiết kiệm chi phí vận
                hành tới 80%.
              </div>
              <div className="pt-4 text-[16px] leading-[16.8px] text-white">
                Nếu các bạn có 1 ý tưởng cung cấp dịch vụ IoT xuất sắc, các bạn
                muốn thử nghiệm nhanh? chúng tôi sẽ giúp bạn miễn phí (dưới 100
                thiết bị)
              </div>
              <div className="pt-4 text-[16px] leading-[16.8px] text-white">
                Nếu dịch vụ của bạn đang dùng thiết bị nhập, phần mềm nước
                ngoài, hoàn toàn không kiểm soát được dữ liệu của khách hàng?
                Nền tảng của chúng tôi sẽ hỗ trợ tích hợp tất các thiết bị, với
                giao thức bất kỳ và đảm bảo dữ liệu được kiểm soát tuyệt đối
                theo yêu cầu.
              </div>
              <div className="pt-4 text-[16px] leading-[16.8px] text-white">
                Nếu các bạn đang triển khai 1 dự án đầu tư công, mà các nhà cung
                cấp nền tảng nước ngoài không thể đáp ứng yêu cầu? Nền tảng của
                chúng tôi phát triển hoàn toàn bởi đội ngũ Viettel, hỗ trợ tùy
                biến không giới hạn, chúng tôi sẽ đồng hành cùng các bạn trọn
                vòng đời sản phẩm.
              </div>
              <div className="flex pt-8">
                <Button
                  type="button"
                  className="rounded-r-lg rounded-tl-lg border-none bg-white text-[#EA0033] hover:-translate-y-px hover:opacity-100 hover:shadow-xl"
                  variant="primary"
                  onClick={() => {
                    navigate(PATHS.PROJECT_MANAGE)
                  }}
                  endIcon={
                    <ArrowRightUpLine
                      width={23}
                      height={23}
                      viewBox="0 0 23 23"
                    ></ArrowRightUpLine>
                  }
                >
                  {t('landingpage:experience_now')}
                </Button>
                <Link to="https://innoway.gitbook.io/innoway/" target="_blank">
                  <Button
                    type="button"
                    className="ml-7 rounded-r-lg rounded-tl-lg border-none bg-white text-[#EA0033] hover:-translate-y-px hover:opacity-100 hover:shadow-xl"
                    variant="primary"
                    endIcon={
                      <ArrowRightUpLine
                        width={23}
                        height={23}
                        viewBox="0 0 23 23"
                      ></ArrowRightUpLine>
                    }
                  >
                    {t('landingpage:user_manual')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
