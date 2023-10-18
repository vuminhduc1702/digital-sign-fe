import { useRef, useState, useEffect } from 'react'
import Q_A from '~/assets/images/landingpage/Frame_427319126.png'
import PlusIconGroup5412 from '~/assets/images/landingpage/Group_5412.png'
import MinusIconGroup5411 from '~/assets/images/landingpage/Group_5411.png'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/Accordion'

export function QandA() {
  const accordionRef_1 = useRef<HTMLDivElement | null>(null)
  const accordionRef_2 = useRef<HTMLDivElement | null>(null)
  const [isAccordionChange, setIsAccordionChange] = useState(false)
  const [isReRender, setIsReRender] = useState(false)
  const items = [
    {
      value: 'item-1',
      triggerText:
        'Làm sao để có thể Quản lý thông tin liên quan tới thuê bao mà doanh nghiệp đã đăng ký?',
      contentText:
        '- Để quản lý được thông tin liên quan tới thuê bao của doanh nghiệp một cách dễ dàng, anh/chị cần đăng ký tài khoản ở trên nền tảng IoT Innoway, đăng nhập và bổ sung thông tin GPKD của doanh nghiệp - Để nhận được sự hỗ trợ chi tiết, vui lòng gọi số ...',
    },
    {
      value: 'item-2',
      triggerText:
        'Khách hàng có thể quản lý những thông tin gì của thuê bao thuộc doanh nghiệp ?',
      contentText:
        'Hệ thống Telco của Viettel hỗ trợ doanh nghiệp các nghiệp vụ sau: - Xem thông tin thuê bao, hợp đồng , hóa đơn, đơn hàng của doanh nghiệp - Thực hiện đăng ký đơn mua hàng mua thuê bao mới một cách thuận tiện - Thực hiện đầu nối trực tuyến mộ cách đơn giản, thuận tiện - Thực hiện nạp tiền, thanh toán hóa đơn, đăng ký các gói dịch vụ giá trị gia tăng - Thực hiện chặn, mở thuê bao một các chủ động',
    },
    {
      value: 'item-3',
      triggerText:
        'Khách hàng có thể quản lý hệ thống thuê bao của mình trên hệ thống Telco không ?',
      contentText:
        'Hệ thống Telco của Viettel hỗ trợ doanh nghiệp quản lý các thuê bao doanh nghiệp, không hỗ trợ với khách hàng cá nhân',
    },
    {
      value: 'item-4',
      triggerText: 'Dịch vụ data M2M là gì?',
      contentText:
        'Hệ thống Telco của Viettel hỗ trợ các doanh nghiệp đã đăng ký sử dụng thuê bao của Viettel quản lý thông tin thuê bao một cách miễn phí. Khách hàng chỉ cần tạo tài khoản và cung cấp thông tin GPKD để thực hiện quản lý.',
    },
  ]

  useEffect(() => {
    setIsReRender(!isReRender)
  }, [isAccordionChange])
  return (
    <>
      <div
        className="flex h-fit justify-center bg-[#f9f9f9] bg-no-repeat pb-20"
        style={{ backgroundImage: `url(${Q_A})` }}
      >
        <div className="w-[1040px]">
          <div className="pb-[40px] pt-[60px] text-center text-[16px] leading-[18.91px] text-primary-400">
            Câu hỏi thường gặp
          </div>
          <div className="flex w-full">
            <div className="w-1/2 pr-[30px]">
              <Accordion type="single" collapsible ref={accordionRef_1}>
                {items.map((item, idx) => (
                  <AccordionItem value={item.value}>
                    <AccordionTrigger
                      onClick={() => {
                        setIsAccordionChange(prevState => !prevState)
                      }}
                      className="flex justify-start"
                    >
                      {accordionRef_1.current?.childNodes.item(idx).dataset
                        .state === 'closed' ? (
                        <>
                          <img src={PlusIconGroup5412} alt="" />
                        </>
                      ) : (
                        <>
                          <img src={MinusIconGroup5411} alt="" />
                        </>
                      )}
                      <div className="pl-[10px] pt-[10px] text-left text-body-sm font-medium">
                        {item.triggerText}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>{item.contentText}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            <div className="w-1/2 pl-[30px]">
              <Accordion type="single" collapsible ref={accordionRef_2}>
                {items.map((item, idx) => (
                  <AccordionItem value={item.value}>
                    <AccordionTrigger
                      onClick={() => {
                        setIsAccordionChange(prevState => !prevState)
                      }}
                      className="flex justify-start"
                    >
                      {accordionRef_2.current?.childNodes.item(idx).dataset
                        .state === 'closed' ? (
                        <>
                          <img src={PlusIconGroup5412} alt="" />
                        </>
                      ) : (
                        <>
                          <img src={MinusIconGroup5411} alt="" />
                        </>
                      )}
                      <div className="pl-[10px] pt-[10px] text-left text-body-sm font-medium">
                        {item.triggerText}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>{item.contentText}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
