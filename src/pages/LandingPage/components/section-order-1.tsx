import Group150 from '~/assets/images/landingpage/Group_150.png'
import Group148 from '~/assets/images/landingpage/Group_148.png'
import { ArrowRightUpLine, CheckboxCircleLine } from '~/components/SVGIcons'
import { Button } from '~/components/Button'
import { useTranslation } from 'react-i18next'
import { Link } from '~/components/Link'
import i18n from '~/i18n'
import { cn } from '~/utils/misc'

export function SectionOrder1() {
  const { t } = useTranslation()

  return (
    <>
      <div className="h-[100px]"></div>
      <div className="xs2:mt-[500px] xs:mt-[460px] flex h-[422px] justify-center sm:mt-[460px] md:mt-[440px] lg:mb-[100px] lg:mt-[340px]  xl:mt-[10px]">
        <div className=" xs2:flex-col-reverse xs2:items-center xs:flex-col-reverse  xs:items-center flex h-full w-[1040px] sm:flex-col-reverse sm:items-center md:flex-col-reverse md:items-center lg:flex-col-reverse lg:items-center xl:flex-row xl:items-center xl:gap-x-20">
          <div
            className={cn(
              'relative w-1/2 md:w-[437px]',
              {
                'xs2:top-[-140px] xs:top-[-97px]': i18n.language === 'vi',
              },
              {
                'xs2:top-[100px] xl:top-[-70px]': i18n.language === 'en',
              },
            )}
          >
            <div className="xs2:w-[240px] xs2:pt-10 xs2:text-[28px] xs:w-[240px] w-[320px] font-semibold leading-[43px] text-black sm:w-[300px] sm:text-[28px] md:w-[460px] md:text-[34px] lg:w-[500px] xl:text-[35px]">
              {t('landingpage:order1.M2M_manage_solution')}
            </div>
            <div className="xs2:w-[200px] xs:w-[200px] w-[443px] pt-5 text-justify text-[16px] leading-[20.8px] text-black sm:w-[300px] md:w-[460px] lg:w-[500px]">
              {t('landingpage_text:section_order_1.text_1')}
            </div>
            <div className="xs2:w-[200px] xs:w-[200px] w-[443px] pt-5 text-justify text-[16px] leading-[20.8px] text-black sm:w-[300px] md:w-[460px] lg:w-[500px]">
              {t('landingpage_text:section_order_1.text_2')}
            </div>

            <div className="xs2:flex-col xs:flex-col flex h-fit pt-[20px] sm:flex-col lg:flex-row lg:gap-10 xl:gap-10">
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
                <div className="xs2:border-[#E2E2E2] mb-[-8px] border-t pt-2">
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
              <div className="xs2:ml-0 xs:ml-0 ml-[90px] h-fit w-fit sm:ml-0">
                <div className="xs2:border-t xs2:border-[#E2E2E2] xs2:pt-2 mb-[-8px] md:border-t md:border-[#E2E2E2] md:pt-2 lg:border-0 lg:pt-0 xl:border-0 xl:pt-0">
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
          <div
            className={cn(
              'relative w-1/2',
              {
                'xs2:top-[-127px] xs:top-[-60px] md:top-[7px] xl:top-[136px]':
                  i18n.language === 'vi',
              },
              {
                'xs2:top-[127px]': i18n.language === 'en',
              },
            )}
          >
            <img
              src={Group150}
              alt="150"
              className="xs2:right-[-20px] xs2:top-[-180px] xs2:h-auto xs2:w-[188px] xs:right-[-17px] xs:top-[-230px] xs:h-auto xs:w-[240px] absolute right-0 top-0 sm:right-[-18.5px] sm:top-[-320px] sm:h-auto sm:w-[320px] md:right-[-35px] md:top-[-400px] md:h-auto md:w-[370px] lg:right-[-6.5px] lg:top-[-470px] lg:h-auto lg:w-[427px] xl:right-[-47.5px] xl:top-[-420px] xl:h-auto xl:w-[460px]"
            />
            <img
              src={Group148}
              alt="150"
              className="xs2:left-[-20px] xs2:top-[-150px] xs2:h-auto xs2:w-[188px] xs:left-[-17px] xs:top-[-190px] xs:h-auto xs:w-[240px] absolute bottom-0 left-0 sm:left-[-18.5px] sm:top-[-280px] sm:h-auto sm:w-[320px] md:left-[-35px] md:top-[-356px] md:h-auto md:w-[370px] lg:left-[-6.5px] lg:top-[-420px] lg:h-auto lg:w-[427px] xl:left-[34px] xl:top-[-370px] xl:h-auto xl:w-[460px]"
            />
          </div>
        </div>
      </div>{' '}
    </>
  )
}
