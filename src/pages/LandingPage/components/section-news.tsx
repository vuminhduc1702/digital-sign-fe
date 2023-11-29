import Carousel from 'react-multi-carousel'
import Pict_6 from '~/assets/images/landingpage/Pict_6.png'
import Pict_7 from '~/assets/images/landingpage/Pict_7.png'
import Pict_8 from '~/assets/images/landingpage/Pict_8.png'
import Pict_9 from '~/assets/images/landingpage/Pict_9.png'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
export function SectionNews() {
  const { t } = useTranslation()
  const slides = [
    {
      src: Pict_6,
      alt: '1',
      link: '/',
      h1: 'Máy tính gần 200 triệu đồng Apple mới bán đã gặp lỗi',
      h2: 'Viettel High Tech tiên phong phát triển Giải pháp công nghệ số cho Thành phố thông minh Ban tổ chức Giải thưởng […]',
    },
    {
      src: Pict_7,
      alt: '1',
      link: '/',
      h1: 'AI chưa nắm bắt được một phần trải nghiệm của con...',
      h2: 'Giám đốc AI Meta cho rằng, các hệ thống trí tuệ nhân tạo ngày nay như ChatGPT vẫn chưa đạt tới trí tuệ và […]',
    },
    {
      src: Pict_8,
      alt: '1',
      link: '/',
      h1: 'Doanh nghiệp Việt nhảy vào sản xuất thiết bị IoT',
      h2: 'Các doanh nghiệp Việt Nam đang trong những bước đi đầu tiên sản xuất thiết bị kết nối Internet nhằm phục vụ thị […]',
    },
    {
      src: Pict_9,
      alt: '1',
      link: '/',
      h1: 'Việt Nam có sản phẩm IoT giành giải tại Asia...',
      h2: 'Vừa qua, tại Singapore, giải pháp IoT - Innoway của Tổng Công ty Công nghiệp Công nghệ cao (Viettel High Tech) […]',
    },
  ]

  const responsive = {
    superLargeDesktop: {
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
      <div>
        <div className="pb-[50px] text-center text-[35px] leading-[43px]">
          {t('landingpage:news.news_')}
        </div>
        <div className="flex justify-center">
          <Carousel
            containerClass="carousel-container w-[1200px]"
            responsive={responsive}
            transitionDuration={300}
            infinite
            itemClass="flex justify-center"
            autoPlay
            autoPlaySpeed={3000}
          >
            {slides.map((item, idx) => (
              <div key={idx}>
                <div
                  className="h-fit w-[202.5px] rounded-xl py-[1px] pl-[1.5px] pr-[1px]"
                  style={{
                    backgroundImage:
                      'linear-gradient(132.92deg, #EE0033 0%, rgba(238, 0, 51, 0) 52.48%, rgba(238, 0, 51, 0.8) 101.78%)',
                  }}
                >
                  <div
                    className="h-fit w-full  bg-white shadow-md"
                    style={{
                      borderRadius: 'inherit',
                    }}
                  >
                    <div className="h-fit w-[200px] ">
                      <img src={item.src} alt={item.alt} />
                    </div>
                    <div className="p-2">
                      <div className="pb-2 text-[18px] font-semibold leading-[24px]">
                        {item.h1}
                      </div>
                      <div className="pb-1 text-[13px] font-normal leading-[15.23px]">
                        {item.h2}
                      </div>
                      <div>
                        <Link
                          to={item.link}
                          className="text-[13px] font-bold leading-[15.23px] text-[#EA0033]"
                        >
                          {t('landingpage:news.view_detail')}
                        </Link>
                      </div>
                    </div>
                  </div>
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
