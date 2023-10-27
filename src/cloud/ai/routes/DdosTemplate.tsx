import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '~/utils/misc'
import btnChevronDownIcon from '~/assets/icons/btn-chevron-down.svg'
import btnRunCode from '~/assets/icons/btn-run-code.svg'
import { CodeSandboxEditor } from '~/cloud/customProtocol/components/CodeSandboxEditor'
import { Dropdown } from '~/components/Dropdown'
import { useDdos } from '../api/ddos/callDdosApi'

export default function DdosTemplate() {
  const [fullScreen, setFullScreen] = useState(false)
  const [viewMode, setViewMode] = useState('default')
  const [codeInput, setCodeInput] = useState(
`{
  "tcp_srcport": 1,
  "tcp_dstport": 1,
  "ip_proto": 1,
  "frame_len": 1,
  "tcp_flags_syn": 1,
  "tcp_flags_reset": 1,
  "tcp_flags_push": 1,
  "tcp_flags_ack": 1,
  "ip_flags_mf": 1,
  "ip_flags_df": 1,
  "ip_flags_rb": 1,
  "tcp_seq": 1,
  "tcp_ack": 1,
  "packets": 1,
  "bytes": 1,
  "tx_packets": 1,
  "tx_bytes": 1,
  "rx_packets": 1,
  "rx_bytes": 1
}`,
  )
  const [typeInput, setTypeInput] = useState('')
  const [codeOutput, setCodeOutput] = useState('')

  const { t } = useTranslation()

  const {data} = useDdos({
    data: JSON.parse(codeInput)
  })

  const callApiDdos = () => {
    const transformStr = codeInput.replaceAll(`'`, `"`)
    console.log(transformStr)
    setCodeInput(transformStr)
  }

  return (
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
                <img
                  height={20}
                  width={20}
                  src={btnChevronDownIcon}
                  className="text-secondary-700 hover:text-primary-400"
                />
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
            <button onClick={() => callApiDdos()}>
              <img
                onClick={() => setTypeInput('Run')}
                src={btnRunCode}
                alt="Submit"
                className="h-5 w-5 cursor-pointer"
              />
            </button>
          </div>
        </div>
          <CodeSandboxEditor
            showRunButton={false}
            isShowLog={false}
            value={codeInput}
            className={`${fullScreen ? '' : '!block'}`}
            setCodeInput={setCodeInput}
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
                <img
                  height={20}
                  width={20}
                  src={btnChevronDownIcon}
                  className="text-secondary-700 hover:text-primary-400"
                />
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
          value={codeOutput}
          readOnly={true}
          showRunButton={false}
          setCodeInput={setCodeOutput}
          isFullScreen={fullScreen}
          viewMode={viewMode}
          editorName={'result'}
        />
      </div>
    </div>
  )
}
