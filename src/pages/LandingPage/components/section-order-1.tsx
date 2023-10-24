import Group150 from '~/assets/images/landingpage/Group_150.png'
import Group148 from '~/assets/images/landingpage/Group_148.png'
import { ArrowRightUpLine, CheckboxCircleLine } from '~/components/SVGIcons'
import { Button } from '~/components/Button'
import { useTranslation } from 'react-i18next'

export function SectionOrder1() {
  const { t } = useTranslation()
  return (
    <>
      <div className="h-[100px]"></div>
      <div className="flex h-[422px] justify-center">
        <div className="flex h-full w-[1040px]">
          <div className="w-1/2">
            <div className="w-[320px] text-[35px] leading-[43px] text-black">
              {t('landingpage:order1.M2M_manage_solution')}
            </div>
            <div className="w-[443px] pt-5 text-[16px] leading-[20.8px] text-black">
              Hệ thống quản lý thuê bao Innoway của Viettel cho phép doanh
              nghiệp quản lý danh sách thuê bao, trình trạng cước, thanh toán,…
              và nhiều tiện ích khác
            </div>
            <div className="flex h-fit pt-[20px]">
              <div className="h-fit w-fit">
                <div className="mb-[-8px]">
                  <CheckboxCircleLine
                    width={25}
                    height={25}
                    viewBox="0 0 25 25"
                    className=""
                  ></CheckboxCircleLine>
                  <p className="relative top-[-25px] pl-[30px] text-[16px] leading-[20.8px] text-black">
                    {t('landingpage:order1.subscription_management')}
                  </p>
                </div>
                <div className="mb-[-8px] border-t border-[#E2E2E2] pt-2">
                  <CheckboxCircleLine
                    width={24}
                    height={25}
                    viewBox="0 0 24 25"
                    className=""
                  ></CheckboxCircleLine>
                  <p className="relative top-[-25px] pl-[30px] text-[16px] leading-[20.8px] text-black">
                    {t('landingpage:order1.contract_management')}
                  </p>
                </div>
              </div>
              <div className="ml-[90px] h-fit w-fit">
                <div className="mb-[-8px]">
                  <CheckboxCircleLine
                    width={25}
                    height={25}
                    viewBox="0 0 25 25"
                    className=""
                  ></CheckboxCircleLine>
                  <p className="relative top-[-25px] pl-[30px] text-[16px] leading-[20.8px] text-black">
                    {t('landingpage:order1.order_management')}
                  </p>
                </div>
                <div className="mb-[-8px] border-t border-[#E2E2E2] pt-2">
                  <CheckboxCircleLine
                    width={24}
                    height={25}
                    viewBox="0 0 24 25"
                    className=""
                  ></CheckboxCircleLine>
                  <p className="relative top-[-25px] pl-[30px] text-[16px] leading-[20.8px] text-black">
                    {t('landingpage:order1.payment_management')}
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-8">
              <a
                href="https://innoway.vn/telco/dashboard/e10f83be-f40b-4506-bad4-a8e16afbcc70"
                target="_blank"
              >
                <Button
                  type="button"
                  className="rounded-r-lg rounded-tl-lg border-none bg-primary-400 text-white hover:-translate-y-px hover:opacity-100 hover:shadow-xl"
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
          <div className="relative w-1/2">
            <img
              src={Group150}
              alt="150"
              className="absolute right-0 top-0 h-fit w-fit"
            />
            <img
              src={Group148}
              alt="150"
              className="absolute bottom-0 left-0 h-fit w-fit"
            />
          </div>
        </div>
      </div>
    </>
  )
}
