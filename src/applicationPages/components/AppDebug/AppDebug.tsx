import { Link } from '~/components/Link'

export function AppDebug() {
  return (
    <>
      <div className="grid grid-cols-2 rounded-lg px-1 py-1">
        <div>
          <img
            src="https://innoway.vn/assets/images/debug.png"
            alt="..."
            className="p-[15px]"
          />
        </div>
        <div className="px-2 py-2">
          <h5 className="mb-2 text-xl font-bold">Vsmart debug</h5>
          <p className="mb-4 text-base">
            Vsmart debug là ứng dụng hỗ trợ các nhà phát triển theo dõi dữ liệu
            của các thiết bị đã tích hợp với nền tảng Innoway.
          </p>
          <p className="mb-4 text-base">
            Để cài đặt ứng dụng, vui lòng thực hiện theo hướng dẫn sau:
          </p>
          <div className="my-5 flex w-full items-center justify-center">
            <div className="flex w-4/5 rounded-lg border border-solid border-[#707070] px-6 py-2">
              <div className="mr-8 flex h-[38px] w-[38px] items-center justify-center rounded-full border border-solid border-[#707070]">
                <span className="text-sm">1</span>
              </div>
              <span className="flex items-center text-lg">
                Quét mã QR bằng điện thoại
              </span>
            </div>
          </div>
          <div className="my-5 flex w-full items-center justify-center">
            <div className="flex w-4/5 rounded-lg border border-solid border-[#707070] px-6 py-2">
              <div className="mr-8 flex h-[38px] w-[38px] items-center justify-center rounded-full border border-solid border-[#707070]">
                <span className="text-sm">2</span>
              </div>
              <span className="flex items-center text-lg">
                Cài đặt ứng dụng Deploygate
              </span>
            </div>
          </div>
          <div className="my-5 flex w-full items-center justify-center">
            <div className="flex w-4/5 rounded-lg border border-solid border-[#707070] px-6 py-2">
              <div className="mr-8 flex h-[38px] w-[38px] items-center justify-center rounded-full border border-solid border-[#707070]">
                <span className="text-sm">3</span>
              </div>
              <span className="flex items-center text-lg">
                Quét mã QR bằng ứng dụng Deploygate
              </span>
            </div>
          </div>
        </div>
        <div className="px-4">
          <h5 className="mb-4 flex items-center justify-center text-xl">
            ANDROID
          </h5>
          <div className="flex items-center justify-center p-[15px]">
            <img
              src="https://innoway.vn/assets/images/debugAdroid.png"
              alt=""
            />
          </div>
          <div className="flex items-center justify-center">
            <div>Hoặc truy cập vào đường link:</div>
            <Link
              to="https://dply.me/3j9wws"
              target="_blank"
              className="font-bold text-black"
            >
              https://dply.me/3j9wws
            </Link>
          </div>
        </div>
        <div className="px-4">
          <h5 className="mb-4 flex items-center justify-center text-xl">IOS</h5>
          <div className="flex items-center justify-center p-[15px]">
            <img src="https://innoway.vn/assets/images/debugIos.png" alt="" />
          </div>
          <div className="flex items-center justify-center">
            <div>Hoặc truy cập vào đường link:</div>
            <Link
              to="https://dply.me/hhdor8"
              target="_blank"
              className="font-bold text-black"
            >
              https://dply.me/hhdor8
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}