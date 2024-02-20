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
      <div className="mb-[100px] h-[559px] bg-[#EA0033] max-xl:h-auto">
        <div
          className="flex h-full w-full items-center justify-center bg-no-repeat p-20 opacity-100 lg:gap-10 lg:h-auto"
          style={{
            backgroundImage: `url(${SectionOrderBG})`,
            backgroundSize: 'cover',
          }}
        >
          <div className="flex h-full w-[992px] max-lg:h-auto max-lg:flex-col sm:w-[540px] xs2:w-[300px] xs2:gap-0 ">
            <div className="w-1/2">
              <iframe
                src="https://www.youtube.com/embed/KvNhWGB5nuk?rel=1&controls=1&showinfo=0&start=1&autoplay=0&enablejsapi=1"
                className="h-full w-[496px] rounded-lg  sm:w-[500px] sm:h-[345px] xs:h-[245px] xs:w-[300px] xs2:h-[245px] xs2:w-[300px]"
              ></iframe>
            </div>
            <div className="ml-10 xs2:ml-0">
              <div className="w-[373px] text-[35px] leading-[43px] text-white sm:text-[40px] sm:my-4 sm:w-[500px] xs2:w-[346px] xs2:text-[20px]">
                {t('landingpage:order.manage_platform')}
              </div>
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
              <div className="flex pt-8 max-sm:flex-col max-sm:items-center">
                <Button
                  type="button"
                  className="rounded-r-lg rounded-tl-lg border-none bg-white text-[#EA0033] hover:-translate-y-px hover:opacity-100 hover:shadow-xl max-sm:mb-[14px] max-sm:w-[220px]"
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
                    className="ml-7 rounded-r-lg rounded-tl-lg border-none bg-white text-[#EA0033] hover:-translate-y-px hover:opacity-100 hover:shadow-xl max-sm:ml-0"
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
