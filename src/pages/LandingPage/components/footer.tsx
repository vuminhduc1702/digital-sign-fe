import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import BgFooter from '~/assets/images/landingpage/bg_footer.png'
import LogoViettel from '~/assets/images/landingpage/Logo_Viettel.png'
import { Button } from '~/components/Button'
import {
  MailSendFill,
  PhoneFill,
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
} from '~/components/SVGIcons'
export function SectionFooter() {
  const [text, setText] = useState('')
  const maxLength = 500
  const { t } = useTranslation()
  const handleTextChange = (e: { target: { value: any } }) => {
    const inputValue = e.target.value
    if (inputValue.length <= maxLength) {
      setText(inputValue)
    }
  }
  return (
    <>
      <div
        className="flex h-[357px] justify-center bg-no-repeat"
        style={{ backgroundImage: `url(${BgFooter})` }}
      >
        <div className="flex h-fit w-[1040px]">
          <div className="ml-[40px] w-[250px] pt-[60px] text-[48px] leading-[56.74px] text-white">
            {t('landingpage:footer.client_support')}
          </div>
          <div className="w-[750px] pl-[150px] pt-[20px]">
            <div className="flex py-2">
              <div className="h-[36px] w-1/3 text-[16px] font-normal leading-[20.8px] text-white">
                {t('landingpage:footer.full_name')}
              </div>
              <div>
                <input
                  type="text"
                  maxLength={50}
                  className="h-[36px] w-[300px] rounded-md border-[0.5px] border-solid border-[#9F9F9F] bg-[#F9F9F9] opacity-60 "
                />
              </div>
            </div>
            <div className="flex py-2">
              <div className="h-[36px] w-1/3 text-[16px] leading-[20.8px] text-white">
                {t('landingpage:footer.email')}
              </div>
              <div>
                <input
                  type="text"
                  maxLength={50}
                  className="h-[36px] w-[300px] rounded-md border-[0.5px] border-solid border-[#9F9F9F] bg-[#F9F9F9] opacity-60 "
                />
              </div>
            </div>
            <div className="flex py-2">
              <div className="h-[36px] w-1/3 text-[16px] leading-[20.8px] text-white">
                {t('landingpage:footer.phone_number')}
              </div>
              <div>
                <input
                  type="number"
                  maxLength={50}
                  className="h-[36px] w-[300px] rounded-md border-[0.5px] border-solid border-[#9F9F9F] bg-[#F9F9F9] opacity-60 "
                />
              </div>
            </div>
            <div className="flex pt-2">
              <div className="h-[36px] w-1/3 text-[16px] leading-[20.8px] text-white">
                {t('landingpage:footer.support_content')}
              </div>
              <div>
                <textarea
                  name=""
                  id=""
                  maxLength={maxLength}
                  onChange={handleTextChange}
                  rows={5}
                  autoComplete="off"
                  className="h-[102px] w-[300px] rounded-md border-[0.5px] border-solid border-[#9F9F9F] bg-[#F9F9F9] opacity-60"
                ></textarea>
                <p className="text-body-xs text-white">
                  {text.length}/{maxLength}
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="w-1/3"></div>
              <div className="flex w-[300px] justify-end">
                <Button
                  type="button"
                  className="rounded-r-lg rounded-tl-lg border-[#EA0033] bg-white text-[#EA0033] hover:-translate-y-px hover:opacity-100 hover:shadow-xl"
                >
                  {t('landingpage:footer.send')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex h-[250px] justify-center bg-[#3A3A3A]">
        <div className="w-[1040px]">
          <div className="flex h-[200px] border-b border-[#4D4D4D] pt-[60px]">
            <div className="pr-[20px] pt-[5px]">
              <img src={LogoViettel} alt="" />
            </div>
            <div>
              <div className="w-[491px] pb-[10px] text-[20px] leading-[23.64px] text-white">
                {t('landingpage:footer.company')}
              </div>
              <div className="w-[600px] text-[16px] leading-[20.8px] text-white">
                Mã số doanh nghiệp: 0100109106-011 do Sở Kế hoạch và Đầu tư
                Thành phố Hà Nội cấp lần đầu ngày 18/07/2005, sửa đổi lần thứ 15
                ngày 18/12/2018
              </div>
              <div className="w-[588px] text-[16px] leading-[20.8px] text-white">
                {t('landingpage:footer.responsible_person')}
              </div>
            </div>
            <div className="pl-[20px]">
              <a
                className="flex pb-[15px] pt-[10px]"
                href="mailto:cskh@viettel.com.vn"
              >
                <MailSendFill
                  width={33}
                  height={33}
                  viewBox="0 0 33 33"
                  className=""
                />
                <div className="pl-[10px] text-[20px] leading-[26px] text-white">
                  {t('landingpage:footer.cskh')}
                </div>
              </a>
              <a className="flex pb-[15px]" href="tel:0123456789">
                <PhoneFill
                  width={33}
                  height={33}
                  viewBox="0 0 33 33"
                  className=""
                />
                <div className="pl-[10px] text-[20px] leading-[26px] text-white">
                  {t('landingpage:footer.phone_used')}
                </div>
              </a>
            </div>
          </div>

          <div className="relative flex h-[50px] items-center">
            <div className="text-[16px] leading-[20.8px] text-[#B1B1B1]">
              {t('landingpage:footer.cre')} {new Date().getFullYear()}
            </div>
            <div className="absolute right-0 flex">
              <div className="pt-[1.7px] text-[16px] leading-[20.8px] text-[#B1B1B1]">
                {t('landingpage:footer.follow')}
              </div>
              <a
                href="https://www.facebook.com/innoway.vn/"
                target="_blank"
                rel="noreferrer"
              >
                <FacebookIcon
                  width={25}
                  height={25}
                  viewBox="0 0 25 25"
                  className="ml-2 mr-1"
                />
              </a>
              <a
                href="https://twitter.com/VInnoway"
                target="_blank"
                rel="noreferrer"
              >
                <LinkedinIcon
                  width={25}
                  height={25}
                  viewBox="0 0 25 25"
                  className="mx-1"
                />
              </a>
              <a
                href="https://www.instagram.com/innoway.vn/"
                target="_blank"
                rel="noreferrer"
              >
                <InstagramIcon
                  width={25}
                  height={25}
                  viewBox="0 0 25 25"
                  className="ml-1"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
