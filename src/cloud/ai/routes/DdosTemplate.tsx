import { HiOutlineXMark } from 'react-icons/hi2'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuChevronDown } from 'react-icons/lu'
import btnRunCode from '@/assets/icons/btn-run-code.svg'
import { CodeSandboxEditor } from '@/cloud/customProtocol/components/CodeSandboxEditor'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/utils/misc'
import { useDdos } from '../api/ddos/callDdosApi'
import { useMutationDdosAi } from '../api/ddos/updateDdosApi'
import { InfoIcon } from '@/components/SVGIcons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function DdosTemplate() {
  const [fullScreen, setFullScreen] = useState(false)
  const [viewMode, setViewMode] = useState('default')
  const codeInputRef = useRef(
    `{
  "tcp_srcport": 53200,
  "tcp_dstport": 8000,
  "ip_proto": 6,
  "frame_len": 222,
  "tcp_flags_syn": 0,
  "tcp_flags_reset": 0,
  "tcp_flags_push": 1,
  "tcp_flags_ack": 1,
  "ip_flags_mf": 0,
  "ip_flags_df": 1,
  "ip_flags_rb": 0,
  "tcp_seq": 1,
  "tcp_ack": 1,
  "packets": 10,
  "bytes": 1175,
  "tx_packets": 6,
  "tx_bytes": 560,
  "rx_packets": 4,
  "rx_bytes": 615
}`,
  )
  const { mutate, isLoading, isSuccess } = useMutationDdosAi()

  const [isOpen, setIsOpen] = useState(false)

  const { t } = useTranslation()

  const { data } = useDdos({
    data: JSON.parse(codeInputRef.current),
  })

  const callApiDdos = () => {
    const parseStr = JSON.parse(codeInputRef.current)
    mutate({
      tcp_srcport: parseStr.tcp_srcport,
      tcp_dstport: parseStr.tcp_dstport,
      ip_proto: parseStr.ip_proto,
      frame_len: parseStr.frame_len,
      tcp_flags_syn: parseStr.tcp_flags_syn,
      tcp_flags_reset: parseStr.tcp_flags_reset,
      tcp_flags_push: parseStr.tcp_flags_push,
      tcp_flags_ack: parseStr.tcp_flags_ack,
      ip_flags_mf: parseStr.ip_flags_mf,
      ip_flags_df: parseStr.ip_flags_df,
      ip_flags_rb: parseStr.ip_flags_rb,
      tcp_seq: parseStr.tcp_seq,
      tcp_ack: parseStr.tcp_ack,
      packets: parseStr.packets,
      bytes: parseStr.bytes,
      tx_packets: parseStr.tx_packets,
      tx_bytes: parseStr.tx_bytes,
      rx_packets: parseStr.rx_packets,
      rx_bytes: parseStr.rx_bytes,
    })
  }

  const formatForm = (data: any) => {
    if (data) {
      return `{
"result": ${data.result}
}`
    }
    return ''
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
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <LuChevronDown className="h-5 w-5 text-secondary-700 hover:text-primary-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="flex flex-col overflow-y-auto rounded-md bg-white p-2 shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade">
                  <DropdownMenuItem
                    className="py-1"
                    onClick={() => {
                      setViewMode('maximize_code')
                    }}
                  >
                    {t('cloud:custom_protocol.service.maximize_result')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="py-1"
                    onClick={() => {
                      setViewMode('minimize_code')
                    }}
                  >
                    {t('cloud:custom_protocol.service.minimize_result')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="py-1"
                    onClick={() => {
                      setViewMode('default')
                    }}
                  >
                    {t('cloud:custom_protocol.service.default_result')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <InfoIcon
                width={20}
                height={20}
                viewBox="0 0 50 50"
                className="cursor-pointer hover:text-primary-400"
                onClick={() => setIsOpen(true)}
              />
              <button onClick={() => callApiDdos()}>
                <img
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
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <LuChevronDown className="h-5 w-5 text-secondary-700 hover:text-primary-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="flex flex-col overflow-y-auto rounded-md bg-white p-2 shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade">
                  <DropdownMenuItem
                    className="py-1"
                    onClick={() => {
                      setViewMode('maximize_result')
                    }}
                  >
                    {t('cloud:custom_protocol.service.maximize_result')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="py-1"
                    onClick={() => {
                      setViewMode('minimize_result')
                    }}
                  >
                    {t('cloud:custom_protocol.service.minimize_result')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="py-1"
                    onClick={() => {
                      setViewMode('default')
                    }}
                  >
                    {t('cloud:custom_protocol.service.default_result')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
        <div className="inline-block overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
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
                  <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-2 flex justify-between">
              <div>tcp_srcport</div>
              <div># cổng nguồn</div>
            </div>
            <div className="mb-2 flex justify-between">
              <div>tcp_dstport</div>
              <div># cổng đích</div>
            </div>
            <div className="mb-2 flex justify-between">
              <div>ip_proto</div>
              <div>
                # trường xác định giao thức tầng trên của gói tin dữ liệu
                (1,6,17)
              </div>
            </div>
            <div className="mb-2 flex justify-between">
              <div>frame_len</div>
              <div># kích thước tổng của gói tin (byte)</div>
            </div>
            <div className="mb-2 flex justify-between">
              <div>tcp_flags_syn</div>
              <div># cờ synchronize</div>
            </div>
            <div className="mb-2 flex justify-between">
              <div>tcp_flags_reset</div>
              <div># cờ reset</div>
            </div>
            <div className="flex justify-between">
              <div>tcp_flags_push</div>
              <div># cờ push</div>
            </div>
            <div className="flex justify-between">
              <div>tcp_flags_ack</div>
              <div># cờ ack</div>
            </div>
            <div className="flex justify-between">
              <div>ip_flags_mf</div>
              <div>
                # cờ chỉ định gói tin là một phần của một dãy các gói tin lớn
              </div>
            </div>
            <div className="flex justify-between">
              <div>ip_flags_df</div>
              <div># cờ chỉ định gói tin đó được phép chia nhỏ</div>
            </div>
            <div className="flex justify-between">
              <div>ip_flags_rb</div>
              <div># cờ reserve bit</div>
            </div>
            <div className="flex justify-between">
              <div>tcp_seq</div>
              <div>
                # số thứ tự của byte đầu tiên trong dữ liệu của gói tin hiện tại
              </div>
            </div>
            <div className="flex justify-between">
              <div>tcp_ack</div>
              <div>
                # số thứ tự của byte tiếp theo mà người gửi mong muốn nhận
              </div>
            </div>
            <div className="flex justify-between">
              <div>packets</div>
              <div>...</div>
            </div>
            <div className="flex justify-between">
              <div>bytes</div>
              <div>...</div>
            </div>
            <div className="flex justify-between">
              <div>tx_packets</div>
              <div>...</div>
            </div>
            <div className="flex justify-between">
              <div>tx_bytes</div>
              <div>...</div>
            </div>
            <div className="flex justify-between">
              <div>rx_packets</div>
              <div>...</div>
            </div>
            <div className="flex justify-between">
              <div>rx_bytes</div>
              <div>...</div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  )
}
