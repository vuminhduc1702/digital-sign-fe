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
    <SandpackProvider files={files} theme={githubLight} template="vanilla">
      <SandpackLayout className={cn('', className)}>
        <SimpleCodeViewer onChangeSimple={onChangeSimple} />
        <SandpackCodeEditor
          className={cn('', {
            '!h-96': isFullScreen,
            'border-0 border-b border-solid border-inherit': !isFullScreen,
            '!h-[600px] border-0': !isFullScreen && !isShowLog,
            '!h-[320px] border-0': isFullScreen && !isShowLog && isEdit,
          })}
          showInlineErrors
          showLineNumbers
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
