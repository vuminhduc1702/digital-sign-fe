import { HiOutlineXMark } from 'react-icons/hi2'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuChevronDown } from 'react-icons/lu'
import btnRunCode from '~/assets/icons/btn-run-code.svg'
import { CodeSandboxEditor } from '~/cloud/customProtocol/components/CodeSandboxEditor'
import { Dialog, DialogTitle } from '~/components/Dialog'
import { Dropdown } from '~/components/Dropdown'
import { cn } from '~/utils/misc'
import { useFuel } from '../api/fuel/callFuelApi'
import { useMutationFuelAi } from '../api/fuel/updateFuelApi'
import { InfoIcon } from '~/components/SVGIcons'

export default function FuelTemplate() {
  const [fullScreen, setFullScreen] = useState(false)
  const [viewMode, setViewMode] = useState('default')
  const codeInputRef = useRef(`{
"distance": 10,
"speed": 30,
"temp_inside": 21,
"gas_type": 1,
"AC": 1,
"rain": 0,
"sun": 1
}`)

  const [isOpen, setIsOpen] = useState(false)
  const { mutate, isLoading, isSuccess } = useMutationFuelAi()
  const { t } = useTranslation()

  const { data } = useFuel({
    data: JSON.parse(codeInputRef.current),
    config: {
      suspense: false,
    },
  })

  const callApiFuel = () => {
    const parseStr = JSON.parse(codeInputRef.current)
    mutate({
      distance: parseStr.distance,
      speed: parseStr.speed,
      temp_inside: parseStr.temp_inside,
      gas_type: parseStr.gas_type,
      AC: parseStr.AC,
      rain: parseStr.rain,
      sun: parseStr.sun,
    })
  }

  const formatForm = (data: any) => {
    if (!data) {
      return ''
    }
    return `{
  "DT": ${data.DT},
  "RF": ${data.RF}
}`
  }

  return (
    <>
      <div
        className={cn(
          'flex flex-col gap-2 ',
          {
            'grid grow grid-cols-1 gap-x-4 md:col-span-3 md:grid-cols-2':
              !fullScreen,
            'md:col-span-3': fullScreen,
          },
          { 'md:grid-cols-6': viewMode !== 'default' },
        )}
      >
        <div
          className={cn(
            'flex flex-col gap-2 md:col-span-1',
            {
              'md:col-span-5':
                viewMode === 'maximize_code' || viewMode === 'minimize_result',
            },
            { 'md:col-span-1': viewMode === 'minimize_code' },
          )}
        >
          <div className="flex justify-between gap-2 rounded-lg bg-secondary-400 px-4 py-2">
            <div className="flex gap-3">
              <p className="text-table-header">
                {t('cloud:custom_protocol.service.code')}
              </p>
            </div>
            <div className="flex gap-3">
              <Dropdown
                icon={
                  <LuChevronDown className="size-5 text-secondary-700 hover:text-primary-400" />
                }
              >
                <div className="absolute right-0 z-10 mt-6 w-32 origin-top-right divide-y divide-secondary-400 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="p-2">
                    <div
                      className="hover:background py-1 hover:cursor-pointer"
                      onClick={() => {
                        setViewMode('maximize_code')
                      }}
                    >
                      {t('cloud:custom_protocol.service.maximize_result')}
                    </div>
                    <div
                      className="py-1 hover:cursor-pointer"
                      onClick={() => {
                        setViewMode('minimize_code')
                      }}
                    >
                      {t('cloud:custom_protocol.service.minimize_result')}
                    </div>
                    <div
                      className="py-1 hover:cursor-pointer"
                      onClick={() => {
                        setViewMode('default')
                      }}
                    >
                      {t('cloud:custom_protocol.service.default_result')}
                    </div>
                  </div>
                </div>
              </Dropdown>
              <InfoIcon
                width={20}
                height={20}
                viewBox="0 0 50 50"
                className="cursor-pointer hover:text-primary-400"
                onClick={() => setIsOpen(true)}
              />
              <button onClick={callApiFuel}>
                <img
                  src={btnRunCode}
                  alt="Submit"
                  className="size-5 cursor-pointer"
                />
              </button>
            </div>
          </div>
          <CodeSandboxEditor
            showRunButton={false}
            isShowLog={false}
            value={codeInputRef.current}
            className={`${fullScreen ? '' : '!block'}`}
            setCodeInput={value => (codeInputRef.current = value)}
            isFullScreen={fullScreen}
            viewMode={viewMode}
            editorName={'code'}
          />
        </div>
        <div
          className={cn(
            'flex flex-col gap-2 md:col-span-1',
            {
              'md:col-span-5':
                viewMode == 'maximize_result' || viewMode == 'minimize_code',
            },
            {
              'md:col-span-1':
                viewMode == 'minimize_result' || viewMode == 'maximize_code',
            },
          )}
        >
          <div className="flex items-center justify-between gap-2 rounded-lg bg-secondary-400 px-4 py-2">
            <div className="flex gap-3">
              <p className="text-table-header">
                {t('cloud:custom_protocol.service.output')}
              </p>
            </div>
            <div className="flex gap-3">
              <Dropdown
                icon={
                  <LuChevronDown className="size-5 text-secondary-700 hover:text-primary-400" />
                }
              >
                <div className="absolute right-0 z-10 mt-6 w-32 origin-top-right divide-y divide-secondary-400 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="p-2">
                    <div
                      className="py-1 hover:cursor-pointer"
                      onClick={() => {
                        setViewMode('maximize_result')
                      }}
                    >
                      {t('cloud:custom_protocol.service.maximize_result')}
                    </div>
                    <div
                      className="py-1 hover:cursor-pointer"
                      onClick={() => {
                        setViewMode('minimize_result')
                      }}
                    >
                      {t('cloud:custom_protocol.service.minimize_result')}
                    </div>
                    <div
                      className="py-1 hover:cursor-pointer"
                      onClick={() => {
                        setViewMode('default')
                      }}
                    >
                      {t('cloud:custom_protocol.service.default_result')}
                    </div>
                  </div>
                </div>
              </Dropdown>
            </div>
          </div>
          <CodeSandboxEditor
            value={formatForm(data)}
            readOnly={true}
            showRunButton={false}
            setCodeInput={() => ''}
            isFullScreen={fullScreen}
            viewMode={viewMode}
            editorName={'result'}
          />
        </div>
      </div>

      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
          <div className="mt-3 text-center sm:mt-0 sm:text-left">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-h1 text-secondary-900">
                {t('cloud:custom_protocol.service.info')}
              </DialogTitle>
              <div className="ml-3 flex h-7 items-center">
                <button
                  className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="sr-only">Close panel</span>
                  <HiOutlineXMark className="size-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-2 flex justify-between">
              <div>distance</div>
              <div># độ dài quãng đường đi được (km)</div>
            </div>
            <div className="mb-2 flex justify-between">
              <div>speed</div>
              <div># tốc độ trung bình trên cả quãng đường (km/h)</div>
            </div>
            <div className="mb-2 flex justify-between">
              <div>temp_inside</div>
              <div># nhiệt độ trong xe (độ C)</div>
            </div>
            <div className="mb-2 flex justify-between">
              <div>gas_type</div>
              <div># loại nhiên liệu 0 là xăng E10, 1 là xăng SP98</div>
            </div>
            <div className="mb-2 flex justify-between">
              <div>AC</div>
              <div># trạng thái của điều hòa</div>
            </div>
            <div className="mb-2 flex justify-between">
              <div>rain</div>
              <div># trạng thái thời tiết</div>
            </div>
            <div className="flex justify-between">
              <div>sun</div>
              <div># trạng thái thời tiết</div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  )
}
