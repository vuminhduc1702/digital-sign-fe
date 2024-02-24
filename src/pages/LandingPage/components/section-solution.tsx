import { Button } from '~/components/Button'
import {
  Time1,
  World1,
  Money1,
  Review1,
  ArrowRightUpLine,
} from '~/components/SVGIcons'
import { useTranslation } from 'react-i18next'
export function SectionSolution() {
  const { t } = useTranslation()

  const slides = [
    {
      title_1: t('landingpage_text:slides.slide_1.text_1'),
      title_2: t('landingpage_text:slides.slide_1.text_2'),
      icon: <Money1 width={65} height={65} viewBox="0 0 65 65"></Money1>,
    },
    {
      title_1: t('landingpage_text:slides.slide_2.text_1'),
      title_2: t('landingpage_text:slides.slide_2.text_2'),
      icon: <Time1 width={65} height={65} viewBox="0 0 65 65"></Time1>,
    },
    {
      title_1: t('landingpage_text:slides.slide_3.text_1'),
      title_2: t('landingpage_text:slides.slide_3.text_2'),
      icon: <Review1 width={65} height={65} viewBox="0 0 65 65"></Review1>,
    },
    {
      title_1: t('landingpage_text:slides.slide_4.text_1'),
      title_2: t('landingpage_text:slides.slide_4.text_2'),
      icon: <World1 width={65} height={65} viewBox="0 0 65 65"></World1>,
    },
  ]

  return (
    <>
      <div className="mb-20 flex justify-center">
        <div className="w-[1040px]">
          <div>
            <p className="py-2 pb-8 text-center text-[28px] font-bold text-[#EA0033] xs2:text-[24px]  xs2:leading-[37px]">
              {t('landingpage:solution.value')}
            </p>
            <div className="flex justify-center">
              <h3 className="  hidden w-[588px] px-5 text-center text-[35px] leading-[43px] xs2:w-[380px] xs2:text-[45px]">
                {t('landingpage:solution.accuracy')}
              </h3>
            </div>
          </div>
          <div className="max-xs:gap-w  flex gap-4 pt-8 max-xl:flex max-xl:flex-wrap max-xl:justify-center max-lg:items-center max-lg:justify-center max-sm:gap-2 ">
            {slides.map((item, idx) => (
              <div
                key={idx}
                className="h-[240px] w-[250px] rounded-lg py-[1px] pl-[1px] pr-[1.5px] max-sm:h-[120px] max-sm:w-[420px] max-xs:w-[320px]"
                style={{
                  backgroundImage:
                    'linear-gradient(132.92deg, #EE0033 0%, rgba(238, 0, 51, 0) 52.48%, rgba(238, 0, 51, 0.8) 101.78%)',
                }}
              >
                <div
                  className="h-full w-full bg-white shadow-md max-sm:flex max-sm:items-center max-sm:justify-center max-sm:gap-16"
                  style={{
                    borderRadius: 'inherit',
                  }}
                >
                  <div className="flex justify-center pt-[50px] max-sm:pt-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex justify-center pt-[10px] text-[20px] leading-[23px] text-black">
                      {item.title_1}
                    </div>
                    <div className="flex justify-center pt-[8px] ">
                      <div className="max-w-[174px] text-center text-[16px] leading-[20.8px] text-[#4D4D4D]">
                        {item.title_2}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid justify-items-end max-xl:px-14 pt-[40px] max-lg:flex max-lg:justify-center max-md:flex max-md:justify-center max-sm:flex max-sm:justify-center">
            <div className="h-fit w-fit ">
              <a
                href="https://cmp.innoway.vn/telco/dashboard/e10f83be-f40b-4506-bad4-a8e16afbcc70"
                target="_blank"
                rel="noreferrer"
              >
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
                >
                  {t('landingpage:experience_now')}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
