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
        className="flex h-[357px] justify-center bg-no-repeat xs2:h-auto xs:h-auto sm:h-auto md:h-auto"
        style={{ backgroundImage: `url(${BgFooter})`, backgroundSize: 'cover' }}
      >
        <div className="flex h-fit  xs2:w-[200px] xs2:flex-col xs2:items-center xs:flex-col xs:items-center sm:w-[500px] sm:flex-col sm:items-center md:w-[760px] md:flex-col md:items-center lg:w-[800px] lg:flex-row xl:w-[1040px] xl:flex-row">
          <div className="ml-[40px] font-semibold leading-[56.74px] text-white xs2:ml-0 xs2:w-[300px] xs2:pt-8 xs2:text-center xs2:text-[30px] sm:w-[300px] md:w-[400px] lg:w-[250px] xl:w-[450px] xl:py-[60px] xl:text-[48px]">
            {t('landingpage:footer.client_support')}
          </div>
          <div className="flex pl-[150px] pt-[20px] xs2:mb-[40px] xs2:w-[300px] xs2:flex-col xs2:pl-[5px] xs:mb-[40px] xs:w-[370px] xs:flex-col xs:pl-[37px] sm:w-[460px] sm:flex-col sm:pl-[20px] md:mb-[40px] lg:w-[650px] xl:w-[750px] xl:justify-center">
            <div className="flex py-2 xs2:flex-col xs:flex-col sm:flex-row md:flex-row">
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
            <div className="flex py-2 xs2:flex-col xs:flex-col sm:flex-row md:flex-row">
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
            <div className="flex py-2 xs2:flex-col xs:flex-col sm:flex-row md:flex-row">
              <div className="h-[36px] w-1/3 text-[16px] leading-[20.8px] text-white xs2:mb-[20px] xs:mb-0 sm:mb-0 md:mb-0 lg:mb-0 xl:mb-0">
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
            <div className="flex pt-2 xs2:flex-col xs:flex-col sm:flex-row md:flex-row">
              <div className="h-[36px] w-1/3 text-[16px] leading-[20.8px] text-white xs2:mb-[20px] xs:mb-[20px] sm:mb-0 md:mb-0 lg:mb-0 xl:mb-0">
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
              <div className="flex justify-end xs2:w-[300px] xs:w-[190px] sm:w-[300px] md:w-[300px] lg:w-[300px] xl:w-[300px]">
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
      <div className="flex justify-center bg-[#3A3A3A] xl:h-[250px] xl:flex-row">
        <div className="xs2:w-[360px] xs:w-[370px] sm:w-[570px] md:w-[700px] lg:w-[1040px] xl:w-[1040px]">
          <div className="flex items-center border-b border-[#4D4D4D] pt-[60px] xs2:mx-[40px] xs2:flex-col xs:mx-[40px] xs:flex-col sm:mx-[40px] sm:flex-col md:mx-[40px] md:h-[270px] md:flex-col lg:mx-[27px] lg:h-[200px] lg:flex-row xl:mx-0 xl:h-[200px] xl:flex-row">
            <div className="pb-[15px] pr-[20px]  pt-[5px]">
              <img src={LogoViettel} alt="" />
            </div>
            <div>
              <div className="w-[491px] pb-[10px] text-[20px] leading-[23.64px] text-white xs2:w-[270px] xs:w-[270px] sm:w-[470px] md:w-[491px]">
                {t('landingpage:footer.company')}
              </div>
            </div>
            <div className="pl-[20px] xs2:pl-0 xs:pl-0 sm:pl-0 md:pl-0">
              <a
                className="flex pb-[15px] pt-[10px]"
                href="mailto:innoway@viettel.com.vn"
              >
                <MailSendFill width={33} height={33} viewBox="0 0 33 33" />
                <div className="pl-[10px] text-[20px] leading-[26px] text-white">
                  {t('landingpage:footer.cskh')}
                </div>
              </a>
              <a className="flex pb-[15px]" href="tel:0123456789">
                <PhoneFill width={33} height={33} viewBox="0 0 33 33" />
                <div className="pl-[10px] text-[20px] leading-[26px] text-white">
                  {t('landingpage:footer.phone_used')}
                </div>
              </a>
            </div>
          </div>

          <div className="relative flex h-[50px] items-center">
            <div className="absolute right-0 flex xs2:mr-[40px] xs:mr-[40px] sm:mr-[40px] md:mx-[40px] lg:mx-[27px] xl:mx-0">
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
