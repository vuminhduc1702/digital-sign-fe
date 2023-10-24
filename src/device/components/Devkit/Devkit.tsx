import { Fragment, useState } from 'react'
import { InputField } from '~/components/Form'
import { SearchIcon } from '~/components/SVGIcons'

export function Devkit() {
  const devkits = ['Espressif Systems', 'Simcom']
  const devkitsDevice_Espressif = [
    {
      type: 'Espressif Systems',
      name: 'ESP32',
      communicationMethods: 'Wifi',
      communicationProtocol: 'MQTT',
      communicateProtocol: 'UART',
      image: 'https://innoway.vn/assets/images/ESP32.jpg',
    },
    {
      type: 'Espressif Systems',
      name: 'ESP32',
      communicationMethods: 'Wifi',
      communicationProtocol: 'MQTT',
      communicateProtocol: 'UART',
      image: 'https://innoway.vn/assets/images/ESP32.jpg',
    },
    {
      type: 'Espressif Systems',
      name: 'ESP32',
      communicationMethods: 'Wifi',
      communicationProtocol: 'MQTT',
      communicateProtocol: 'UART',
      image: 'https://innoway.vn/assets/images/ESP32.jpg',
    },
  ]
  const devkitsDevice_Simcom = [
    {
      type: 'Simcom',
      name: 'SIMCOM 7020E',
      communicationMethods: 'NB-IoT',
      communicationProtocol: 'MQTT',
      communicateProtocol: 'UART',
      image: 'https://innoway.vn/assets/images/SIMCOM7020.png',
    },
  ]
  return (
    <>
      <div className="flex px-1 py-1">
        <div className="mr-3 h-[90vh] w-1/4 rounded-md bg-[#eceff1] shadow-md">
          <div className="p-[10px]">
            <InputField
              type="text"
              className="h-[37.6px] rounded bg-stone-300"
              classnamefieldwrapper="relative"
              startIcon={
                <SearchIcon
                  height={20}
                  width={20}
                  viewBox="0 0 20 20"
                  className="absolute left-2 top-1/2 z-20 -translate-y-1/2"
                />
              }
            />
          </div>

          <div className="mt-[15px] h-[85vh]">
            {devkits.map((item, idx) => (
              <div className="p-[10px]">
                <div className="flex h-[37.6px] items-center justify-center rounded-md bg-[#B5B6B7] text-base font-medium text-white shadow-md">
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="ml-3 w-3/4">
          <div>
            <div className="mb-6 flex h-[36px] w-full items-center rounded-md bg-[#EC1B2E] px-2.5 text-base text-white opacity-[.85] shadow-lg">
              HƯỚNG DẪN TÍCH HỢP THIẾT BỊ
            </div>
            <div className="mb-4 rounded-md border border-solid bg-[#eceff1] p-5 text-body-sm shadow-lg">
              Khu vực này bao gồm thông tin các bộ DevKit đi kèm code mẫu, tài
              liệu hướng dẫn tích hợp và bộ SDK để kết nối thiết bị của bạn với
              InnoWay.
            </div>
          </div>

          <div>
            <div className="mb-6 flex h-[36px] w-full items-center rounded-md bg-[#EC1B2E] px-2.5 text-base text-white opacity-[.85] shadow-lg">
              Espressif System
            </div>
            <div className="border-opacity-15 mb-4 grid grid-cols-2 rounded-md border-x border-solid border-white bg-[#eceff1] pb-8">
              {devkitsDevice_Espressif.map((item, idx) => (
                <div className="p-4">
                  <div className="shadow-md">
                    <div className="flex h-[37px] items-center justify-center rounded-t-md bg-[#858687] text-xl font-medium text-white">
                      {item.name}
                    </div>
                    <div className="flex bg-black/[.03] px-4 py-2">
                      <div className="w-1/3">
                        <img src={item.image} alt="" />
                      </div>
                      <div className="w-2/3 p-4">
                        <h5 className="mb-2 text-xl font-medium">Mô tả</h5>
                        <p className="mb-4 text-body-sm">
                          - Cách thức truyền thông: {item.communicationMethods}
                        </p>
                        <p className="mb-4 text-body-sm">
                          - Giao thức truyền thông: {item.communicationProtocol}
                        </p>
                        <p className="mb-4 text-body-sm">
                          - Giao thức giao tiếp: {item.communicateProtocol}
                        </p>
                        <a
                          href="http://203.113.138.18:4447/s/KgQ7GzSirnD26Wx/download"
                          className="float-right text-body-sm font-medium"
                        >
                          Tải tài liệu
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-6 flex h-[36px] w-full items-center rounded-md bg-[#EC1B2E] px-2.5 text-base text-white opacity-[.85] shadow-lg">
              Simcom
            </div>
            <div className="border-opacity-15 mb-4 grid grid-cols-2 rounded-md border-x border-solid border-white bg-[#eceff1] pb-8 ">
              {devkitsDevice_Simcom.map((item, idx) => (
                <div className="p-4">
                  <div className="shadow-lg">
                    <div className="flex h-[37px] items-center justify-center rounded-t-md bg-[#858687] text-xl font-medium text-white">
                      {item.name}
                    </div>
                    <div className="flex bg-black/[.03] px-4 py-2">
                      <div className="w-1/3">
                        <img src={item.image} alt="" />
                      </div>
                      <div className="w-2/3 p-4">
                        <h5 className="mb-2 text-xl font-medium">Mô tả</h5>
                        <p className="mb-4 text-body-sm">
                          - Cách thức truyền thông: {item.communicationMethods}
                        </p>
                        <p className="mb-4 text-body-sm">
                          - Giao thức truyền thông: {item.communicationProtocol}
                        </p>
                        <p className="mb-4 text-body-sm">
                          - Giao thức giao tiếp: {item.communicateProtocol}
                        </p>
                        <a
                          href="http://203.113.138.18:4447/s/KgQ7GzSirnD26Wx/download"
                          className="float-right text-body-sm font-medium"
                        >
                          Tải tài liệu
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
