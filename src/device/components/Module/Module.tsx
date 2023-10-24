import { useEffect, useRef, useState } from 'react'
import { Checkbox } from '~/components/Checkbox'
import { FieldWrapper } from '~/components/Form'

export function Module() {
  const Module = [
    'Tất cả',
    'NB-IoT',
    '2G',
    'Wifi',
    'Wifi + Bluetooth',
    'Bluetooth',
    'Zigbee',
  ]

  const ModuleDevices = [
    {
      module: 'NB-IOT',
      name: 'BC660k',
      type: 'LTE-NB2',
      wattage: 'class 3',
      speed: '158.5Kbps (HL), 127Kbps (DL)',
      operaTemperature: '-40 → 85°C',
      size: '17.7x15.8x2.0mm',
      image: 'https://innoway.vn/assets/images/module/bc660k.png',
    },
    {
      module: 'NB-IOT',
      name: 'SIM7022',
      type: 'LTE-NB2',
      wattage: 'class 3',
      speed: '159Kbps (UL), 127Kbps (DL)',
      operaTemperature: '-40 → 85°C',
      size: '17.6x15.7x2.3mm',
      image: 'https://innoway.vn/assets/images/module/sim7022.png',
    },
    {
      module: 'Wifi',
      name: 'WT32C3-S5',
      type: 'ESP32-C3',
      frequency: '2.4GHz',
      memory: '4MB Flash',
      speed: '150Mbps',
      operaTemperature: '-40 → 85°C',
      size: '24x16x2.3mm',
      image: 'https://innoway.vn/assets/images/module/wifi.jpg',
    },
    {
      module: 'BLE 4.2 Bluetooth',
      name: 'WT51822-S2',
      type: 'LTE-NB2',
      memory: '2Mbps và 256kB Flash',
      speed: '159Kbps (UL),127Kbps (DL)',
      operaTemperature: '-25 → 75°C',
      size: '18.5x9.1x2.0mm',
      image: 'https://innoway.vn/assets/images/module/bluetooth.jpg',
    },
    {
      module: 'Zigbee',
      name: 'SMCZ01P',
      frequency: '2.4 GHz, EFR32MG21',
      memory: '2Mbps, 512KB Flash',
      operaTemperature: '-40 → 85°C',
      size: '22x16x2.2mm',
      image: 'https://innoway.vn/assets/images/module/smcz01p.png',
    },
  ]
  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  const [selectedItem, setSelectedItem] = useState<number>(1)
  const [filteredModuleDevices, setFilteredModuleDevices] =
    useState<Array<Object>>(ModuleDevices)
  const changeStateRadioGroup = (idx: number) => {
    setSelectedItem(idx)
  }
  useEffect(() => {
    if (selectedItem !== 0) {
      setFilteredModuleDevices(
        ModuleDevices.filter(
          item =>
            item.module.toLowerCase() === Module[selectedItem].toLowerCase(),
        ),
      )
    } else {
      setFilteredModuleDevices(ModuleDevices)
    }
  }, [selectedItem])

  return (
    <>
      <div className="">
        <div className="flex px-1 py-1">
          <div className="mr-3 h-[90vh] w-1/4 rounded-md bg-[#eceff1] shadow-md">
            <div className="h-[85vh] overflow-auto">
              <div className="flex items-center bg-[#858687] px-6 pb-6 pt-3 text-center text-xl font-medium text-white">
                CHỌN PHƯƠNG THỨC TRUYỀN THÔNG
              </div>
              <div className="p-8">
                {Module.map((item, idx) => (
                  <FieldWrapper
                    className="mt-2 flex h-8 flex-row-reverse items-center justify-end gap-x-2"
                    label={item}
                    classlabel="mt-1"
                    key={idx}
                  >
                    <Checkbox
                      className="flex h-4 w-4 items-center justify-center pt-0"
                      onClick={() => changeStateRadioGroup(idx)}
                      checked={selectedItem === idx}
                    />
                  </FieldWrapper>
                ))}
              </div>
            </div>
          </div>
          <div className="ml-3 w-3/4">
            <div>
              <div className="mb-6 flex h-[36px] w-full items-center rounded-md bg-[#EC1B2E] px-2.5 text-base text-white opacity-[.85] shadow-lg">
                CÁC SẢN PHẨM
              </div>
              <div className="mb-4 rounded-md border border-solid bg-[#eceff1] p-5 text-body-sm shadow-lg">
                Gồm thông tin các bộ sản phẩm đi kèm code mẫu, tài liệu hướng
                dẫn tích hợp.
              </div>
            </div>
            <div>
              <div className="mb-6 flex h-[36px] w-full items-center rounded-md bg-[#EC1B2E] px-2.5 text-base text-white opacity-[.85] shadow-lg">
                {Module[selectedItem]}
              </div>
              <div className="border-opacity-15 mb-4 grid grid-cols-2 rounded-md border-x border-solid border-white bg-white">
                {filteredModuleDevices.map((item: any, idx) => (
                  <div className="p-4">
                    <div className="shadow-md">
                      <div className="flex h-[60px] items-center justify-center rounded-t-md bg-[#858687] text-xl font-medium text-slate-900">
                        {item.name}
                      </div>
                      <div className="flex bg-black/[.03] px-4 py-2">
                        <div className="w-1/3">
                          <img src={item.image} alt="" />
                        </div>
                        <div className="w-2/3 overflow-auto p-4">
                          <h5 className="mb-2 text-xl font-medium">Mô tả</h5>
                          <ul>
                            {Object.entries(item)
                              .filter(
                                ([key]) => key !== 'name' && key !== 'image',
                              )
                              .map(([key, value]: [string, any]) => (
                                <li key={key} className="mb-4 text-body-sm">
                                  {'• '}
                                  {capitalizeFirstLetter(key)} {' : '} {value}
                                </li>
                              ))}
                          </ul>

                          <a
                            href="http://203.113.138.18:4447/s/KgQ7GzSirnD26Wx/download"
                            className="float-right text-body-sm font-medium"
                          >
                            Tải xuống
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
      </div>
    </>
  )
}
