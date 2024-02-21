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
      <div className="h-[100px]"></div>
      <div className="flex h-[422px] justify-center xs2:mt-[500px] xs:mt-[460px] sm:mt-[460px] md:mt-[540px] lg:mt-[340px] xl:mt-[10px]">
        <div className="flex h-full w-[1040px] xs2:flex-col-reverse xs2:items-center xs:flex-col-reverse xs:items-center sm:flex-col-reverse sm:items-center md:flex-col-reverse md:items-center lg:flex-col-reverse lg:items-center xl:flex-row xl:items-center">
          <div className="w-1/2 ">
            <div className="w-[320px] text-[35px] leading-[43px] text-black xs2:w-[240px] xs:w-[240px] lg:w-[500px]">
              {t('landingpage:order1.M2M_manage_solution')}
            </div>
            {/* <div className="w-[443px] pt-5 text-[16px] leading-[20.8px] text-black">
              Hệ thống quản lý thuê bao Innoway của Viettel cho phép doanh
              nghiệp quản lý danh sách thuê bao, trình trạng cước, thanh toán,…
              và nhiều tiện ích khác
            </div> */}
            <div className="w-[443px] pt-5 text-[16px] leading-[20.8px] text-black xs2:w-[200px] xs:w-[200px] sm:w-[300px] lg:w-[500px]">
              Nền tảng tiên phong tại Việt Nam, cung cấp đồng thời 2 dịch vụ nền
              tảng quản lý kết nối (CMP) và quản lý ứng dụng (AEP). Hỗ trợ toàn
              trình cho các dịch vụ IoT dùng công nghệ cellular (2G/4G/Nb-IoT).
            </div>
            <div className="w-[443px] pt-5 text-[16px] leading-[20.8px] text-black xs2:w-[200px] xs:w-[200px] sm:w-[300px] lg:w-[500px]">
              Nền tảng quản lý kết nối của Viettel cho phép doanh nghiệp quản lý
              danh sách thuê bao, trình trạng cước thanh toán, định vị thuê
              bao... và nhiều tiện ích khác
            </div>
            <div className="flex h-fit pt-[20px] xs2:flex-col xs:flex-col sm:flex-col lg:flex-row">
              <div className="h-fit w-fit">
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
              <div className="ml-[90px] h-fit w-fit xs2:ml-0 xs:ml-0 sm:ml-0">
                <div className="mb-[-8px]">
                  <CheckboxCircleLine
                    width={25}
                    height={25}
                    viewBox="0 0 25 25"
                  ></CheckboxCircleLine>
                  <p className="relative top-[-25px] pl-[30px] text-[16px] leading-[20.8px] text-black">
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
          <div className="relative w-1/2  xl:top-[192px]">
            <img
              src={Group150}
              alt="150"
              className="absolute right-0 top-0 h-fit w-fit xs2:right-[-37px] xs2:top-[-170px] xs:right-[-42px] xs:top-[-190px] sm:right-[-42px] sm:top-[-270px] md:right-[-45px] md:top-[-356px] lg:top-[-420px] lg:h-fit lg:w-fit"
            />
            <img
              src={Group148}
              alt="150"
              className="absolute bottom-0 left-0 h-fit w-fit md:bottom-[20px] lg:bottom-[20px] lg:h-fit lg:w-fit xl:bottom-[-20px]"
            />
          </div>
        </div>
      </div>{' '}
    </>
  )
}
