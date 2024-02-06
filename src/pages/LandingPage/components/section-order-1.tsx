import Group150 from '~/assets/images/landingpage/Group_150.png'
import Group148 from '~/assets/images/landingpage/Group_148.png'
import { ArrowRightUpLine, CheckboxCircleLine } from '~/components/SVGIcons'
import { Button } from '~/components/Button'
import { useTranslation } from 'react-i18next'
import { Link } from '~/components/Link'

export function SectionOrder1() {
  const { t } = useTranslation()
  return (
    <>
      {/* <div className="h-[100px] xs:h-0"></div> */}
      <div className="flex h-[422px] justify-center max-lg:my-[0px]  max-lg:h-auto">
        <div className="flex h-full w-[1040px] max-xs:w-[500px] max-xl:mx-[10px] max-lg:w-[800px] max-lg:gap-20 max-md:flex-col-reverse max-md:items-center">
          <div className="w-1/2  max-xs:flex  max-xs:flex-col  max-xs:items-center">
            <div className="w-[320px]  max-xs:w-[300px] text-[35px] leading-[43px] text-black">
              {t('landingpage:order1.M2M_manage_solution')}
            </div>
            <div className="w-[443px] max-lg:w-[343px] max-xs:w-[280px] pt-5 text-[16px] leading-[20.8px] text-black">
              Nền tảng tiên phong tại Việt Nam, cung cấp đồng thời 2 dịch vụ nền
              tảng quản lý kết nối (CMP) và quản lý ứng dụng (AEP). Hỗ trợ toàn
              trình cho các dịch vụ IoT dùng công nghệ cellular (2G/4G/Nb-IoT).
            </div>
            <div className="w-[443px] max-md:w-[243px] max-xs:w-[280px] max-lg:w-[343px] pt-5 text-[16px] leading-[20.8px] text-black">
              Nền tảng quản lý kết nối của Viettel cho phép doanh nghiệp quản lý
              danh sách thuê bao, trình trạng cước thanh toán, định vị thuê
              bao... và nhiều tiện ích khác
            </div>
            <div className="flex max-lg:flex-col max-md:items-center h-fit pt-[20px]">
              <div className="h-fit w-fit ">
                <div className="mb-[-8px]">
                  <CheckboxCircleLine
                    width={25}
                    height={25}
                    viewBox="0 0 25 25"
                  ></CheckboxCircleLine>
                  <p className="relative top-[-25px] pl-[30px] text-[16px] leading-[20.8px] text-black">
                    {t('landingpage:order1.subscription_management')}
                  </p>
                </div>
                <div className="mb-[-8px] border-t border-[#E2E2E2] pt-2">
                  <CheckboxCircleLine
                    width={24}
                    height={25}
                    viewBox="0 0 24 25"
                  ></CheckboxCircleLine>
                  <p className="relative top-[-25px] pl-[30px] text-[16px] leading-[20.8px] text-black">
                    {t('landingpage:order1.contract_management')}
                  </p>
                </div>
                <div className="mb-[-8px] border-t border-[#E2E2E2] pt-2">
                  <CheckboxCircleLine
                    width={24}
                    height={25}
                    viewBox="0 0 24 25"
                  ></CheckboxCircleLine>
                  <p className="relative top-[-25px] pl-[30px] text-[16px] leading-[20.8px] text-black">
                    {t('landingpage:order1.subscription_locating')}
                  </p>
                </div>
              </div>
              <div className="ml-[90px] max-lg:ml-0 md-ml-2 h-fit w-fit max-lg:border-t max-lg:border-[#E2E2E2] max-lg:pt-2">
                <div className="mb-[-8px]">
                  <CheckboxCircleLine
                    width={25}
                    height={25}
                    viewBox="0 0 25 25"
                  ></CheckboxCircleLine>
                  <p className="relative top-[-25px] pl-[30px] text-[16px] leading-[20.8px] text-black ">
                    {t('landingpage:order1.order_management')}
                  </p>
                </div>
                <div className="mb-[-8px] border-t border-[#E2E2E2] pt-2">
                  <CheckboxCircleLine
                    width={24}
                    height={25}
                    viewBox="0 0 24 25"
                  ></CheckboxCircleLine>
                  <p className="relative top-[-25px] pl-[30px] text-[16px] leading-[20.8px] text-black">
                    {t('landingpage:order1.payment_management')}
                  </p>
                </div>
                
              </div>
            </div>
            <div className="pt-8">
              <Link to="https://iot.viettel.vn/" target="_blank">
                <Button
                  type="button"
                  className="bg-primary-400 rounded-r-lg rounded-tl-lg border-none text-white hover:-translate-y-px hover:opacity-100 hover:shadow-xl"
                  variant="primary"
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
              </Link>
            </div>
          </div>
          <div className="relative w-1/2 max-md:py-[80px] ">
            <img
              src={Group150}
              alt="150"
              className="absolute right-0 top-0 h-fit w-fit max-lg:w-fit max-lg:h-fit max-md:w-fit max-md:h-fit"
            />
            <img
              src={Group148}
              alt="150"
              className="absolute bottom-0 left-0 h-fit w-fit max-lg:bottom-[296px] max-lg:left-[-30px] max-lg:w-fit max-lg:h-fit max-md:top-[50px] max-md:w-fit max-md:h-fit max-sm:top-[50px]"
            />
          </div>
        </div>
      </div>
    </>
  )
}
