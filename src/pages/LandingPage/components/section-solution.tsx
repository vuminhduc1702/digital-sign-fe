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
  const slides = [
    {
      title_1: 'Tiết kiệm',
      title_2: 'Giảm chi phí vận hành',
      icon: (
        <Money1
          width={65}
          height={65}
          viewBox="0 0 65 65"
          className=""
        ></Money1>
      ),
    },
    {
      title_1: 'Chính xác',
      title_2: 'Cung cấp thông tin chính xác, kịp thời',
      icon: (
        <Time1 width={65} height={65} viewBox="0 0 65 65" className=""></Time1>
      ),
    },
    {
      title_1: 'Trải nghiệm',
      title_2: 'Nâng cao trải nghiệm khách hàng',
      icon: (
        <Review1
          width={65}
          height={65}
          viewBox="0 0 65 65"
          className=""
        ></Review1>
      ),
    },
    {
      title_1: 'An toàn',
      title_2: 'Cải thiện độ an toàn',
      icon: (
        <World1
          width={65}
          height={65}
          viewBox="0 0 65 65"
          className=""
        ></World1>
      ),
    },
  ]
  const { t } = useTranslation()
  return (
    <>
      <div className="flex h-[403px] justify-center">
        <div className="w-[1040px]">
          <div className="">
            <p className="py-2 pb-8 text-center text-[28px] font-bold text-[#EA0033]">
              {t('landingpage:solution.value')}
            </p>
            <div className="flex justify-center">
              <h3 className="w-[588px] px-5 text-center text-[35px] leading-[43px]">
                {t('landingpage:solution.accuracy')}
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 pt-8">
            {slides.map((item, idx) => (
              <div
                className="h-[240px] w-[250px] rounded-lg py-[1px] pl-[1px] pr-[1.5px]"
                style={{
                  backgroundImage:
                    'linear-gradient(132.92deg, #EE0033 0%, rgba(238, 0, 51, 0) 52.48%, rgba(238, 0, 51, 0.8) 101.78%)',
                }}
              >
                <div
                  className="h-full w-full  bg-white shadow-md"
                  style={{
                    borderRadius: 'inherit',
                  }}
                >
                  <div className="flex justify-center pt-[50px]">
                    {item.icon}
                  </div>
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
            ))}
          </div>
          <div className="grid  justify-items-end pt-[40px]">
            <div className="h-fit w-fit ">
              <a
                href="https://innoway.vn/telco/dashboard/e10f83be-f40b-4506-bad4-a8e16afbcc70"
                target="_blank"
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
                      className=""
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
