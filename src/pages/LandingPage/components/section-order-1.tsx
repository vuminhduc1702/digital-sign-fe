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
      <div className="flex h-[422px] justify-center max-lg:my-[0px] max-lg:h-auto">
        <div className="flex h-full w-[1040px] max-lg:gap-20 max-md:flex-col-reverse  max-md:items-center xs:mx-[10px] xs:w-[500px] sm:w-[540px]">
          <div className="flex w-1/2 xs2:flex-col xs2:items-center xs:w-[400px]  xs:flex-col  xs:items-center  sm:w-[520px]">
            <div className="w-[320px]  text-[35px] leading-[43px] text-black xs2:w-[300px] xs:w-[300px] sm:mt-16 sm:w-[520px] ">
              {t('landingpage:order1.M2M_manage_solution')}
            </div>
            <div className="w-[443px] pt-5 text-[16px] leading-[20.8px] text-black xs2:w-[300px] xs:w-[300px] sm:w-[520px]">
              Nền tảng tiên phong tại Việt Nam, cung cấp đồng thời 2 dịch vụ nền
              tảng quản lý kết nối (CMP) và quản lý ứng dụng (AEP). Hỗ trợ toàn
              trình cho các dịch vụ IoT dùng công nghệ cellular (2G/4G/Nb-IoT).
            </div>
            <div className="w-[443px] pt-5 text-[16px] leading-[20.8px] text-black max-lg:w-[343px] max-md:w-[243px] xs2:w-[300px] xs:w-[300px] sm:w-[520px]">
              Nền tảng quản lý kết nối của Viettel cho phép doanh nghiệp quản lý
              danh sách thuê bao, trình trạng cước thanh toán, định vị thuê
              bao... và nhiều tiện ích khác
            </div>
            <div className="flex h-fit pt-[20px] xs2:flex-col xs2:items-center xs:flex-col xs:items-center">
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
              <div className="md-ml-2 ml-[90px] h-fit w-fit max-lg:border-t max-lg:border-[#E2E2E2] max-lg:pt-2 xs2:ml-[-2px] xs:ml-[-2px]">
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
                  className="rounded-r-lg rounded-tl-lg border-none bg-primary-400 text-white hover:-translate-y-px hover:opacity-100 hover:shadow-xl"
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
          <div className="relative w-1/2 xs2:py-[80px] ">
            <img
              src={Group150}
              alt="150"
              className="absolute right-0 top-0 h-fit w-fit xs2:right-[-27px] xs2:h-fit xs2:w-fit "
            />
            <img
              src={Group148}
              alt="150"
              className="absolute bottom-0 left-0 h-fit w-fit xs2:h-fit xs2:w-fit xs:bottom-[-76px] xs:w-fit xs:h-fit"
            />
          </div>
        </div>
      </div>
    </>
  )
}
