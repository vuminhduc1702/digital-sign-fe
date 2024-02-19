import { useTranslation } from 'react-i18next'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~/components/Carousel'

export function SectionClient() {
  const slides = [
    {
      src: 'https://cmp.innoway.vn/assets/images/landingPageTelco/partner_1.svg',
      alt: '1',
    },
    {
      src: 'https://cmp.innoway.vn/assets/images/landingPageTelco/partner_8.svg',
      alt: '8',
    },
    {
      src: 'https://cmp.innoway.vn/assets/images/landingPageTelco/partner_3.svg',
      alt: '3',
    },
    {
      src: 'https://cmp.innoway.vn/assets/images/landingPageTelco/partner_7.svg',
      alt: '7',
    },
    {
      src: 'https://cmp.innoway.vn/assets/images/landingPageTelco/partner_6.svg',
      alt: '6',
    },
    {
      src: 'https://cmp.innoway.vn/assets/images/landingPageTelco/partner_9.svg',
      alt: '9',
    },
    {
      src: 'https://cmp.innoway.vn/assets/images/landingPageTelco/partner_11.svg',
      alt: '11',
    },
    {
      src: 'https://cmp.innoway.vn/assets/images/landingPageTelco/partner_12.svg',
      alt: '12',
    },
    {
      src: 'https://cmp.innoway.vn/assets/images/landingPageTelco/partner_13.svg',
      alt: '13',
    },
  ]
  const { t } = useTranslation()
  return (
    <>
      <div className="h-[100px]"></div>
      <div>
        <div className="pb-[50px] text-center text-[35px] leading-[43px] lg:mt-[180px]">
          {t('landingpage:client.partner')}
        </div>
        <div className="flex justify-center ">
          <Carousel className=" xs2:w-[280px] xs:w-[280px] md:w-[620px] lg:w-[870px] xl:w-[1200px]">
            <CarouselContent>
              {slides.map(item => (
                <CarouselItem>
                  <div>
                    <div className="h-fit w-[200px]">
                      <img src={item.src} alt={item.alt} />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
      <div className="h-[100px]"></div>
    </>
  )
}
