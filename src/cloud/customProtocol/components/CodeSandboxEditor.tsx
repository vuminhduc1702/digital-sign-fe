import {
  SandpackCodeEditor,
  SandpackConsole,
  SandpackLayout,
  SandpackProvider,
  useSandpack,
} from '@codesandbox/sandpack-react'
import { githubLight } from '@codesandbox/sandpack-themes'
import { type CSSProperties, useEffect, useState } from 'react'
import { cn } from '@/utils/misc'

type CodeSandboxEditorProps = {
  label?: string
  readOnly?: boolean
  value?: string
  setCodeInput: React.Dispatch<React.SetStateAction<string>>
  isShowLog?: boolean
  className?: string
  isFullScreen?: boolean
  defaultValue?: string
  showRunButton?: boolean
  style?: CSSProperties
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
  className,
  showRunButton,
  style,
  isUpdate = false,
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
          className={cn('border-0 border-b border-solid border-inherit', {
            '!h-[600px]': !isFullScreen && !isShowLog,
            '!h-[530px]': isFullScreen && !isUpdate && isShowLog,
            '!h-[830px]': isFullScreen && !isUpdate && !isShowLog,
            '!h-[440px]': isFullScreen && isUpdate && isShowLog,
            '!h-[740px]': isFullScreen && isUpdate && !isShowLog,
          })}
          showInlineErrors
          showLineNumbers
          readOnly={readOnly}
          showRunButton={showRunButton}
          wrapContent={true}
          style={style}
        />
        {isShowLog && <SandpackConsole standalone showSyntaxError={true} />}
      </SandpackLayout>
    </SandpackProvider>
  )
}
