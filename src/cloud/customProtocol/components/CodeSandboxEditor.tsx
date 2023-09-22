import {
  SandpackCodeEditor,
  SandpackConsole,
  SandpackLayout,
  SandpackProvider,
  useSandpack
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
  className
}: CodeSandboxEditorProps) {
  const files = {
    '/index.js': {
      code: value || ``,
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
          className='border-0 border-b border-solid border-inherit'
          showInlineErrors={true}
          showLineNumbers={true}
          readOnly={readOnly}
        />
        {isShowLog && <SandpackConsole standalone={true} showSyntaxError={true} />}
      </SandpackLayout>
    </SandpackProvider>
  )
}
