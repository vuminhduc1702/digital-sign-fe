import {
  SandpackCodeEditor,
  SandpackConsole,
  SandpackLayout,
  SandpackProvider,
  useSandpack,
} from '@codesandbox/sandpack-react'
import { ecoLight } from '@codesandbox/sandpack-themes'
import { useEffect } from 'react'
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
}: CodeSandboxEditorProps) {
  let files = {
    '/index.js': {
      code: (value ? value : defaultValue) || '',
    },
  }

  const onChangeSimple = (e: string) => {
    setCodeInput(e)
  }

  return (
    <SandpackProvider files={files} theme={ecoLight} template="vanilla">
      <SandpackLayout className={cn('', className)}>
        <SimpleCodeViewer onChangeSimple={onChangeSimple} />
        <SandpackCodeEditor
          className={cn('', {
            '!h-96': isFullScreen,
            'border-0 border-b border-solid border-inherit': !isFullScreen,
            '!h-[600px] border-0': !isFullScreen && !isShowLog,
            '!h-[320px] border-0': isFullScreen && !isShowLog && isEdit,
          })}
          showInlineErrors={true}
          showLineNumbers={true}
          readOnly={readOnly}
        />
        {isShowLog && (
          <SandpackConsole
            className={cn('', {
              '!h-96': isFullScreen,
            })}
            standalone={true}
            showSyntaxError={true}
          />
        )}
      </SandpackLayout>
    </SandpackProvider>
  )
}
