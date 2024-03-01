import { Link, useNavigate } from 'react-router-dom'
import SectionOrderBG from '~/assets/images/landingpage/BG_sectionorder.png'
import { Button } from '~/components/Button'
import { PATHS } from '~/routes/PATHS'
import { ArrowRightUpLine } from '~/components/SVGIcons'
import { useTranslation } from 'react-i18next'
import i18n from '~/i18n'
import { cn } from '~/utils/misc'

export function SectionOrder() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <>
      <div className="h-[100px]"></div>
      <div className="mb-[100px] h-[559px] bg-[#EA0033] max-xl:h-auto">
        <div
          className="flex h-full w-full items-center justify-center bg-no-repeat p-20 opacity-100 lg:h-auto lg:gap-10"
          style={{
            backgroundImage: `url(${SectionOrderBG})`,
            backgroundSize: 'cover',
          }}
        >
          <div className="xs2:w-[300px] xs2:gap-0 flex h-full max-xl:flex-col max-lg:h-auto sm:w-[540px] lg:w-[800px] lg:items-center lg:gap-5 xl:w-[992px] xl:items-center xl:gap-x-10 ">
            <div className="xs2::w-1/2 xs:w-1/2 w-1/2 lg:w-[480px]">
              <iframe
                src="https://www.youtube.com/embed/KvNhWGB5nuk?rel=1&controls=1&showinfo=0&start=1&autoplay=0&enablejsapi=1"
                className="xs2:h-[245px] xs2:w-[300px] xs:h-[245px] xs:w-[300px] h-full rounded-lg sm:h-[345px] sm:w-[500px] xl:w-[496px]"
              ></iframe>
            </div>
            <div className="xs2:ml-0 ml-10">
              <div className="xs2:w-[346px] xs2:text-[20px] w-[373px] text-[35px] leading-[43px] text-white sm:my-4 sm:w-[500px] sm:text-[40px]">
                {t('landingpage:order.manage_platform')}
              </div>
              <div className="pt-5 text-justify text-[16px] leading-[16.8px] text-white xl:w-[460px]">
                {t('landingpage_text:section_order.text_1')}
              </div>
              <div className="pt-4 text-justify text-[16px] leading-[16.8px] text-white xl:w-[460px]">
                {t('landingpage_text:section_order.text_2')}
              </div>
              <div className="pt-4 text-justify text-[16px] leading-[16.8px] text-white xl:w-[460px]">
                {t('landingpage_text:section_order.text_3')}
              </div>
              <div className="pt-4 text-justify text-[16px] leading-[16.8px] text-white xl:w-[460px]">
                {t('landingpage_text:section_order.text_4')}
              </div>
              <div className="flex pt-8 max-sm:flex-col max-sm:items-center">
                <Button
                  type="button"
                  className={cn(
                    'rounded-r-lg rounded-tl-lg border-none bg-white text-[#EA0033] hover:-translate-y-px hover:opacity-100 hover:shadow-xl max-sm:mb-[14px] xl:px-5',
                    {
                      'max-sm:w-[215px]': i18n.language === 'en',
                    },
                    {
                      'xs2:w-[270px]': i18n.language === 'vi',
                    },
                  )}
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
                    className="xs2:px-12 ml-7 rounded-r-lg rounded-tl-lg border-none bg-white text-[#EA0033] hover:-translate-y-px hover:opacity-100 hover:shadow-xl max-sm:ml-0 xl:px-5"
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
