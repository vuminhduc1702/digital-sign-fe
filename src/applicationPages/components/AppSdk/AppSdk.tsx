import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '~/components/Link'
import { DownloadSdk } from '~/components/SVGIcons'

export function AppSdk() {
  const Sdks = [
    {
      name: 'Smarthome SDK',
      exist: 'true',
      info: 'Ứng dụng cho phép kết nối và quản lý các thiết bị thông minh trong nhà',
      image: 'https://innoway.vn/assets/images/overview/appSdk.png',
      link: 'http://203.113.138.18:4447/s/r2mdFKfdA28otJt/download',
    },
    {
      name: 'Smart Tracking SDK',
      exist: 'false',
      info: 'Đang phát triển',
    },
    {
      name: 'Smart Packing SDK',
      exist: 'false',
      info: 'Đang phát triển',
    },
    {
      name: 'Industry SDK',
      exist: 'false',
      info: 'Đang phát triển',
    },
  ]

  const textBlack = 'text-black bg-transparent'
  const textWhite = 'text-white bg-[#ff0000]'
  const afterAndroid = `after:content-[""] after:block after:absolute after:left-full after:top-0 after:border-solid  
  after:border-t-[transparent] after:border-r-[transparent] after:border-b-[red] after:border-l-[transparent] 
  after:border-t-[0] after:border-r-[30px] after:border-b-[39.9px] after:border-l-[0]`
  const afterIOS = `after:content-[""] after:block after:absolute after:right-full after:top-0 after:border-solid 
  after:border-t-[transparent] after:border-r-[red] after:border-b-[transparent] after:border-l-[transparent] 
  after:border-b-[0] after:border-r-[30px] after:border-t-[39.9px] after:border-l-[0]`

  const initialState = Sdks.map(sdk => ({ chooseAndroid: true }))
  const [sdkStates, setSdkStates] = useState(initialState)
  const toggleChooseAndroid = (index: number) => {
    const updatedStates = [...sdkStates]
    updatedStates[index].chooseAndroid = true
    setSdkStates(updatedStates)
  }
  const toggleChooseIOS = (index: number) => {
    const updatedStates = [...sdkStates]
    updatedStates[index].chooseAndroid = false
    setSdkStates(updatedStates)
  }
  const { t } = useTranslation()
  return (
    <>
      <div className="grid grid-cols-2 px-3 py-3">
        {Sdks.map((item, idx) => (
          <div className="m-4 h-fit rounded bg-[#eceff1] shadow-lg">
            <h5 className="flex h-[40px] border-b border-solid border-[#ccc]">
              <div className="flex w-1/2 items-center justify-center p-[10px] text-xl font-medium">
                {item.name}
              </div>
              <div
                className={`relative flex w-1/4 items-center justify-center text-xl font-medium  ${
                  sdkStates[idx].chooseAndroid
                    ? textWhite + ' ' + afterAndroid
                    : textBlack
                }`}
                onClick={() => toggleChooseAndroid(idx)}
              >
                {t('application:android')}
              </div>
              <div
                className={`relative flex w-1/4 items-center justify-center text-xl font-medium ${
                  !sdkStates[idx].chooseAndroid
                    ? textWhite + ' ' + afterIOS
                    : textBlack
                }`}
                onClick={() => toggleChooseIOS(idx)}
              >
                {t('application:ios')}
              </div>
            </h5>
            {item.exist === 'true' ? (
              <div className="mt-2 flex">
                <div className="w-3/5">
                  <img className="" src={item.image} alt="" />
                </div>
                <div className="px-3">
                  <p className="mb-1 text-sm tracking-[.5px]">{item.info}</p>
                  <div>
                    <div>
                      <Link
                        className="flex border-b border-solid border-[#ccc] py-4"
                        to={item.link as string}
                        target="_blank"
                      >
                        <DownloadSdk
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                        />
                        <div className="pl-4">
                          {t('application:download_doc')}
                        </div>
                      </Link>
                    </div>
                    <div>
                      <Link
                        className="flex border-b border-solid border-[#ccc] py-4"
                        to={item.link as string}
                        target="_blank"
                      >
                        <DownloadSdk
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                        />
                        <div className="pl-4">
                          {t('application:download_sdk')}
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-1 flex h-[50px] max-h-[100px] items-center pl-10 text-sm tracking-[.5px]">
                  {item.info}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
