import { useTranslation } from 'react-i18next'
import Group45 from '~/assets/images/landingpage/Group_45.png'
import { Button } from '~/components/Button'
import { CheckboxCircleLine, ArrowRightUpLine } from '~/components/SVGIcons'

export function SectionIntro() {
  const { t } = useTranslation()
  return (
    <>
      <div className="flex h-[620px] justify-center">
        <div className="flex w-[1040px] flex-row rounded-2xl bg-white shadow-md">
          <div className="basis-1/2 pl-4">
            <div className="pl-[40px] pt-[50px]">
              <p className="text-xl font-bold text-red-500">
                {t('landingpage:introduction')}
              </p>
            </div>
            <div>
              <div className="pl-[40px] pt-[13px] text-3xl leading-tight text-black">
                {t(
                  'landingpage:introduction_section.service_transmit_data_accurate',
                )}
              </div>
              <div className="pl-[40px] pt-[20px]">
                <div className="mb-[-8px]">
                  <CheckboxCircleLine
                    width={24}
                    height={25}
                    viewBox="0 0 24 25"
                    className=""
                  ></CheckboxCircleLine>
                  <p className="relative top-[-25px] pl-[30px] text-base/[21px]">
                    M2M là công nghệ cho phép cho các thiết bị có thể trao đổi
                    với các hệ thống thông qua kết nối mạng.
                  </p>
                </div>
                <div className="mb-[-8px]">
                  <CheckboxCircleLine
                    width={24}
                    height={25}
                    viewBox="0 0 24 25"
                    className=""
                  ></CheckboxCircleLine>
                  <p className="relative top-[-25px] pl-[30px] text-base/[21px]">
                    Dịch vụ data M2M: Là dịch vụ trong đó sim data được sử dụng
                    để truyền tải dữ liệu.
                  </p>
                </div>
                <div>
                  <CheckboxCircleLine
                    width={24}
                    height={25}
                    viewBox="0 0 24 25"
                    className=""
                  ></CheckboxCircleLine>
                  <p className="relative top-[-25px] pl-[30px] text-base/[21px]">
                    M2M là công nghệ cho phép các thiết bị có thể trao đổi với
                    các hệ thống thông qua kết nối mạng. Dịch vụ data M2M: Là
                    dịch vụ trong đó sim data được sử dụng để truyền tải dữ
                    liệu. Công nghệ IOT phát triển dựa trên nền tảng kết hợp
                    công nghệ mạng Internet (mạng wifi, mạng viễn thông băng
                    rộng 4G, 5G) và công nghệ vi cơ điện tử, giúp người dùng
                    kiểm soát mọi vật tối ưu hơn chỉ bằng 1 thiết bị thông minh.
                  </p>
                </div>
              </div>
              <div className="pl-[40px] pt-[15px]">
                <Button
                  type="button"
                  className="rounded-r-lg rounded-tl-lg border-none bg-primary-400 hover:-translate-y-px hover:opacity-100 hover:shadow-xl"
                  variant="primary"
                  endIcon={
                    <ArrowRightUpLine
                      width={23}
                      height={23}
                      viewBox="0 0 23 23"
                      className=""
                    ></ArrowRightUpLine>
                  }
                >
                  {t('landingpage:introduction_section.view_product')}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex h-full w-full basis-1/2 items-center justify-center">
            <div
              className="h-[375px] w-[502px] bg-no-repeat px-2"
              style={{
                backgroundImage: `url(${Group45})`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </>
  )
}
