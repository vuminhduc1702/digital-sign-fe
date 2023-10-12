import {
  SandpackCodeEditor,
  SandpackConsole,
  SandpackLayout,
  SandpackProvider,
  useSandpack,
} from '@codesandbox/sandpack-react'
import { githubLight } from '@codesandbox/sandpack-themes'
import { useEffect, useState } from 'react'
import { cn } from '~/utils/misc'

type CodeSandboxEditorProps = {
  label?: string
  readOnly?: boolean
  value?: string
  setCodeInput: React.Dispatch<React.SetStateAction<string>>
  isShowLog?: boolean
  className?: string
  isFullScreen?: boolean
  defaultValue?: string
  isEdit?: boolean
  viewMode?: string
  editorName?: string
  isUpdate?: boolean
}

type SimpleCodeProps = {
  onChangeSimple: (e: string) => void
}

const SimpleCodeViewer = ({ onChangeSimple }: SimpleCodeProps) => {
  const { sandpack } = useSandpack()
  const { files, activeFile } = sandpack

  const code = files[activeFile].code
  useEffect(() => {
    onChangeSimple(code)
  }, [code])
  return <></>
}

export function CodeSandboxEditor({
  setCodeInput,
  readOnly,
  value,
  isShowLog,
  isFullScreen,
  defaultValue,
  isEdit,
  className,
  viewMode,
  editorName,
  isUpdate,
}: CodeSandboxEditorProps) {
  const [textDefault, setTextDefault] = useState(defaultValue)
  let files = {
    '/index.js': {
      code: (textDefault ? textDefault : value) || '',
    },
  }

  const onChangeSimple = (e: string) => {
    setCodeInput(e)
    setTextDefault('')
  }

  return (
    <SandpackProvider
      files={files}
      theme={githubLight}
      template="vanilla"
      options={{
        autoReload: false,
        autorun: false,
        recompileMode: 'delayed',
        recompileDelay: 5000,
      }}
    >
      <SandpackLayout className={cn('', className)}>
        <SimpleCodeViewer onChangeSimple={onChangeSimple} />
        <SandpackCodeEditor
          className={cn('', {
            '!h-96': isFullScreen,
            'border-0 border-b border-solid border-inherit': !isFullScreen,
            '!h-[600px] border-0': !isFullScreen && !isShowLog,
            '!h-[320px] border-0': isFullScreen && !isShowLog && isEdit,
            '!h-[45rem]': isFullScreen
              ? editorName == 'code'
                ? viewMode == 'maximize_code' || viewMode == 'minimize_result'
                : viewMode == 'maximize_result' || viewMode == 'minimize_code'
              : '',
            '!h-[41rem]':
              isUpdate && isFullScreen
                ? editorName == 'code'
                  ? viewMode == 'maximize_code' || viewMode == 'minimize_result'
                  : viewMode == 'maximize_result' || viewMode == 'minimize_code'
                : '',
            '!h-[3rem]': isFullScreen
              ? editorName == 'code'
                ? viewMode == 'maximize_result' || viewMode == 'minimize_code'
                : viewMode == 'maximize_code' || viewMode == 'minimize_result'
              : '',
          })}
          showInlineErrors
          showLineNumbers
          readOnly={readOnly}
        />
        {isShowLog && (
          <SandpackConsole
            className={cn('', {
              '!h-96': isFullScreen,
              '!h-[45rem]': isFullScreen
                ? editorName == 'code'
                  ? viewMode == 'maximize_code' || viewMode == 'minimize_result'
                  : viewMode == 'maximize_result' || viewMode == 'minimize_code'
                : '',
              '!h-[41rem]':
                isUpdate && isFullScreen
                  ? editorName == 'code'
                    ? viewMode == 'maximize_code' ||
                      viewMode == 'minimize_result'
                    : viewMode == 'maximize_result' ||
                      viewMode == 'minimize_code'
                  : '',
              '!h-[3rem]': isFullScreen
                ? editorName == 'code'
                  ? viewMode == 'maximize_result' || viewMode == 'minimize_code'
                  : viewMode == 'maximize_code' || viewMode == 'minimize_result'
                : '',
            })}
            standalone
            showSyntaxError={true}
          />
        )}
      </SandpackLayout>
    </SandpackProvider>
  )
}
