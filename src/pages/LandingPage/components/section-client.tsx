import Carousel from 'react-multi-carousel'

export function SectionClient({}: {}) {
  const slides = [
    {
      src: 'https://innoway.vn/assets/images/landingPageTelco/partner_1.svg',
      alt: '1',
    },
    {
      src: 'https://innoway.vn/assets/images/landingPageTelco/partner_8.svg',
      alt: '8',
    },
    {
      src: 'https://innoway.vn/assets/images/landingPageTelco/partner_3.svg',
      alt: '3',
    },
    {
      src: 'https://innoway.vn/assets/images/landingPageTelco/partner_7.svg',
      alt: '7',
    },
    {
      src: 'https://innoway.vn/assets/images/landingPageTelco/partner_6.svg',
      alt: '6',
    },
    {
      src: 'https://innoway.vn/assets/images/landingPageTelco/partner_9.svg',
      alt: '9',
    },
    {
      src: 'https://innoway.vn/assets/images/landingPageTelco/partner_11.svg',
      alt: '11',
    },
    {
      src: 'https://innoway.vn/assets/images/landingPageTelco/partner_12.svg',
      alt: '12',
    },
    {
      src: 'https://innoway.vn/assets/images/landingPageTelco/partner_13.svg',
      alt: '13',
    },
  ]

  const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  }
  return (
    <>
      <div className="h-[100px]"></div>
      <div className="">
        <div className="pb-[50px] text-center text-[35px] leading-[43px]">
          Đối tác của chúng tôi
        </div>
        <div className="flex justify-center">
          <Carousel
            className=""
            containerClass="carousel-container w-[1040px]"
            responsive={responsive}
            transitionDuration={300}
            infinite
            itemClass="flex justify-center"
            autoPlay
            autoPlaySpeed={3000}
          >
            {slides.map((item, idx) => (
              <div className="">
                <div className="h-fit w-[200px]">
                  <img src={item.src} alt={item.alt} />
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
      <div className="h-[100px]"></div>
    </>
  )
}
