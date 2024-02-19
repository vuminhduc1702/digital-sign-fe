import { type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import Group45 from '~/assets/images/landingpage/Group_45.png'
import { Button } from '~/components/Button'
import { CheckboxCircleLine, ArrowRightUpLine } from '~/components/SVGIcons'
import { scrollToIntro } from '~/utils/misc'

export function SectionIntro({
  solutionRef,
}: {
  solutionRef: RefObject<HTMLDivElement>
}) {
  const { t } = useTranslation()
  return (
    <>
      <div className="flex h-[620px] justify-center xs2:mt-[690px] xs:mt-[640px] sm:mt-[2px] sm:h-auto    ">
        <div className="flex w-[1040px] flex-row rounded-2xl bg-white shadow-md  max-lg:flex-col-reverse xs2:h-auto xs2:w-[340px] xs:h-auto xs:w-[340px] sm:h-auto sm:w-[510px] md:w-[700px] lg:w-[900px] xl:w-[1024px]">
          <div className="basis-1/2 px-4">
            <div className="pl-[40px] pt-[50px] xs2:mx-[40px] xs2:pl-0">
              <p className="text-xl font-bold text-primary-400 xs2:text-[32px]">
                {t('landingpage:introduction')}
              </p>
            </div>
            <div className="  xs2:mx-[40px]">
              <div className="pl-[40px] pt-[13px] text-3xl leading-tight text-black max-xs:pl-0">
                {t(
                  'landingpage:introduction_section.service_transmit_data_accurate',
                )}
              </div>
              <div className="pl-[40px] pt-[20px] xs2:w-[100%] xs2:pl-0">
                <div className="mb-[-8px]">
                  <CheckboxCircleLine
                    width={24}
                    height={25}
                    viewBox="0 0 24 25"
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
                  ></CheckboxCircleLine>
                  <p className="relative top-[-25px] pl-[30px]  text-base/[21px]">
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
              <div className="pl-[40px] pt-[15px] xs2:pb-[37px] xs2:pl-0">
                <Button
                  type="button"
                  className="rounded-r-lg rounded-tl-lg border-none bg-primary-400 hover:-translate-y-px hover:opacity-100 hover:shadow-xl"
                  variant="primary"
                  endIcon={
                    <ArrowRightUpLine
                      width={23}
                      height={23}
                      viewBox="0 0 23 23"
                    ></ArrowRightUpLine>
                  }
                  onClick={() => scrollToIntro(solutionRef)}
                >
                  {t('landingpage:introduction_section.view_product')}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex h-full w-full basis-1/2 items-center justify-center">
            <div
              className=": h-[375px] w-[502px] bg-no-repeat  px-2 xs2:h-[255px] xs2:w-[340px] xs:h-[255px] xs:w-[340px]"
              style={{
                backgroundImage: `url(${Group45})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
              }}
            ></div>
          </div>
        </div>
      </div>
    </>
  )
}
