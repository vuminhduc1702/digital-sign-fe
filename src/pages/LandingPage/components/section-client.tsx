import { useTranslation } from 'react-i18next'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~/components/Carousel'
import Partner1 from '~/assets/images/landingpage/partner_1.svg'
import Parther2 from '~/assets/images/landingpage/partner_11.svg'
import Parther3 from '~/assets/images/landingpage/partner_12.svg'
import Parther4 from '~/assets/images/landingpage/partner_13.svg'
import Parther5 from '~/assets/images/landingpage/partner_3.svg'
import Parther6 from '~/assets/images/landingpage/partner_6.svg'
import Parther7 from '~/assets/images/landingpage/partner_7.svg'
import Parther8 from '~/assets/images/landingpage/partner_8.svg'
import Parther9 from '~/assets/images/landingpage/partner_9.svg'

export function SectionClient() {
  const slides = [
    {
      src: Partner1,
      alt: '1',
    },
    {
      src: Parther2,
      alt: '8',
    },
    {
      src: Parther3,
      alt: '3',
    },
    {
      src: Parther4,
      alt: '7',
    },
    {
      src: Parther5,
      alt: '6',
    },
    {
      src: Parther6,
      alt: '9',
    },
    {
      src: Parther7,
      alt: '11',
    },
    {
      src: Parther8,
      alt: '12',
    },
    {
      src: Parther9,
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
