import React from 'react'
import { useNavigate } from 'react-router-dom'
import SectionOrderBG from '~/assets/images/landingpage/BG_sectionorder.png'
import { Button } from '~/components/Button'
import { PATHS } from '~/routes/PATHS'
import {
  ArrowRightUpLine,
  CheckboxCircleLineWhite,
} from '~/components/SVGIcons'

export function SectionOrder({}: {}) {
  const navigate = useNavigate()
  return (
    <>
      <div className="h-[100px]"></div>
      <div className="h-[559px] bg-[#EA0033]">
        <div
          className="flex h-full w-full items-center justify-center bg-no-repeat p-20 opacity-100"
          style={{ backgroundImage: `url(${SectionOrderBG})` }}
        >
          <div className="flex h-full w-[992px]">
            <div className="w-1/2">
              <iframe
                src="https://www.youtube.com/embed/KvNhWGB5nuk?rel=1&controls=1&showinfo=0&start=1&autoplay=0&enablejsapi=1"
                className="h-full w-[496px] rounded-lg"
              ></iframe>
            </div>
            <div className="ml-10">
              <div className="w-[373px] text-[35px] leading-[43px] text-white">
                Nền tảng quản lý, tự động hóa và thu thập dữ liệu
              </div>
              <div className="pt-5 text-[16px] leading-[20.8px] text-white">
                Hệ thống Cloud Innoway của Viettel cho phép các nhà tích hợp hệ
                thống triển khai tích hợp các giải pháp quản lý điều khiển thiết
                bị một cách hiệu quả
              </div>
              <div className="flex h-fit pt-[20px]">
                <div className="h-fit w-1/2">
                  <div className="mb-[-8px] h-[55px] border-b">
                    <CheckboxCircleLineWhite
                      width={25}
                      height={25}
                      viewBox="0 0 25 25"
                      className=""
                    ></CheckboxCircleLineWhite>
                    <p className="relative top-[-25px] pl-[30px] text-[16px] leading-[20.8px] text-white">
                      Quản lý trạng thái thiết bị
                    </p>
                  </div>
                  <div className="mb-[-8px] h-[55px] pt-4">
                    <CheckboxCircleLineWhite
                      width={24}
                      height={25}
                      viewBox="0 0 24 25"
                      className=""
                    ></CheckboxCircleLineWhite>
                    <p className="relative top-[-25px] pl-[30px] text-[16px] leading-[20.8px] text-white">
                      Triển khai mô hình nghiệp vụ no code - low code
                    </p>
                  </div>
                </div>
                <div className="ml-4 h-fit w-1/2">
                  <div className="mb-[-8px] h-[55px] border-b">
                    <CheckboxCircleLineWhite
                      width={25}
                      height={25}
                      viewBox="0 0 25 25"
                      className=""
                    ></CheckboxCircleLineWhite>
                    <p className="relative top-[-25px] pl-[30px] text-[16px] leading-[20.8px] text-white">
                      Bảo mật dữ liệu người dùng
                    </p>
                  </div>
                  <div className="mb-[-8px] h-[55px] pt-4">
                    <CheckboxCircleLineWhite
                      width={24}
                      height={25}
                      viewBox="0 0 24 25"
                      className=""
                    ></CheckboxCircleLineWhite>
                    <p className="relative top-[-25px] pl-[30px] text-[16px] leading-[20.8px] text-white">
                      Hỗ trợ nhiều loại giao thức
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-8">
                <Button
                  type="button"
                  className="rounded-r-lg rounded-tl-lg border-none bg-white text-[#EA0033] hover:-translate-y-px hover:opacity-100 hover:shadow-xl"
                  variant="primary"
                  onClick={() => navigate(PATHS.PROJECT_MANAGE)}
                  endIcon={
                    <ArrowRightUpLine
                      width={23}
                      height={23}
                      viewBox="0 0 23 23"
                      className=""
                    ></ArrowRightUpLine>
                  }
                >
                  Trải nghiệm ngay
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
