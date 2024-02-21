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
        className="flex h-[357px] justify-center  bg-no-repeat max-lg:h-auto"
        style={{ backgroundImage: `url(${BgFooter})`, backgroundSize: 'cover' }}
      >
        <div className="max-md:item-center flex h-fit w-[1040px] max-lg:h-auto max-lg:flex-col max-lg:items-center">
          <div className="ml-[40px] w-[250px] pt-[60px] text-[48px] leading-[56.74px] text-white max-lg:ml-0  max-lg:w-[350px]">
            {t('landingpage:footer.client_support')}
          </div>
          <div className="w-[750px] pl-[150px] pt-[20px] max-md:flex max-md:flex-col max-md:items-center max-md:pl-0 xs2:w-[250px]">
            <div className="flex py-2 max-md:flex-col">
              <div className="h-[36px] w-1/3 text-[16px] font-normal leading-[20.8px] text-white">
                {t('landingpage:footer.full_name')}
              </div>
              <div className="">
                <input
                  type="text"
                  maxLength={50}
                  className="h-[36px] w-[300px] rounded-md border-[0.5px] border-solid border-[#9F9F9F] bg-[#F9F9F9] opacity-60 "
                />
              </div>
            </div>
            <div className="flex py-2 max-md:flex-col">
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
            <div className="flex py-2 max-md:flex-col">
              <div className="h-[36px] w-1/3 text-[16px] leading-[20.8px] text-white">
                {t('landingpage:footer.phone_number')}
              </div>
              <div>
                <input
                  type="number"
                  maxLength={50}
                  className="h-[36px] w-[300px] rounded-md border-[0.5px] border-solid border-[#9F9F9F] bg-[#F9F9F9] opacity-60 xs2:mt-3 "
                />
              </div>
            </div>
            <div className="flex pt-2 max-md:flex-col">
              <div className="h-[36px] w-1/3 text-[16px] leading-[20.8px] text-white max-md:mb-6">
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
            <div className="flex max-lg:pb-[16px] max-md:w-[300px]">
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
      <div className="flex h-[250px] justify-center  bg-[#3A3A3A] max-lg:h-auto">
        <div className="w-[1040px] xs2:w-[360px] xs:w-[425px]">
          <div className="flex h-[200px] border-b border-[#4D4D4D] pt-[60px] max-lg:h-auto max-lg:flex-col max-sm:mx-2">
            <div className="pr-[20px] pt-[5px] max-lg:my-5">
              <img src={LogoViettel} alt="" />
            </div>
            <div>
              <div className="w-[491px] pb-[10px] text-[20px] leading-[23.64px] text-white max-sm:w-[320px]">
                {t('landingpage:footer.company')}
              </div>
            </div>
            <div className="pl-[20px] max-lg:pl-0">
              <a
                className="flex pb-[15px] pt-[10px]"
                href="mailto:quyln3@viettel.com.vn"
              >
                <MailSendFill width={33} height={33} viewBox="0 0 33 33" />
                <div className="pl-[10px] text-[20px] leading-[26px] text-white">
                  {t('landingpage:footer.cskh')}
                </div>
              </a>
              <a className="flex pb-[15px]" href="tel:08699999904">
                <PhoneFill width={33} height={33} viewBox="0 0 33 33" />
                <div className="pl-[10px] text-[20px] leading-[26px] text-white">
                  {t('landingpage:footer.phone_used')}
                </div>
              </a>
            </div>
          </div>

          <div className="relative flex h-[50px] items-center">
            <div className="absolute right-0 flex max-sm:left-0 max-sm:mx-2">
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
