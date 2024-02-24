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
          className="flex h-full w-full items-center justify-center bg-no-repeat p-20 opacity-100 lg:h-auto lg:gap-10"
          style={{
            backgroundImage: `url(${SectionOrderBG})`,
            backgroundSize: 'cover',
          }}
        >
          <div className="flex  h-full max-xl:flex-col max-lg:h-auto xs2:w-[300px] xs2:gap-0 sm:w-[540px] lg:w-[800px] lg:items-center lg:gap-5 xl:w-[992px] xl:items-center xl:gap-12 ">
            <div className="w-1/2">
              <iframe
                src="https://www.youtube.com/embed/KvNhWGB5nuk?rel=1&controls=1&showinfo=0&start=1&autoplay=0&enablejsapi=1"
                className="h-full rounded-lg xs2:h-[245px] xs2:w-[300px] xs:h-[245px] xs:w-[300px] sm:h-[345px] sm:w-[500px] xl:w-[496px]"
              ></iframe>
            </div>
            <div className="ml-10 xs2:ml-0">
              <div className="w-[373px] text-[35px] leading-[43px] text-white xs2:w-[346px] xs2:text-[20px] sm:my-4 sm:w-[500px] sm:text-[40px]">
                {t('landingpage:order.manage_platform')}
              </div>
              <div className="pt-5 text-[16px] leading-[16.8px] text-white">
                {t('landingpage_text:section_order.text_1')}
              </div>
              <div className="pt-4 text-[16px] leading-[16.8px] text-white">
                {t('landingpage_text:section_order.text_2')}
              </div>
              <div className="pt-4 text-[16px] leading-[16.8px] text-white">
                {t('landingpage_text:section_order.text_3')}
              </div>
              <div className="pt-4 text-[16px] leading-[16.8px] text-white">
                {t('landingpage_text:section_order.text_4')}
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
                    className="ml-7 xs2:px-12 rounded-r-lg rounded-tl-lg border-none bg-white text-[#EA0033] hover:-translate-y-px hover:opacity-100 hover:shadow-xl max-sm:ml-0"
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
