import ace from 'ace-builds/src-noconflict/ace'
import AceEditor from 'react-ace'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/theme-solarized_light'

import { FieldWrapper } from '~/components/Form'
import { useState } from 'react'

ace.config.set(
  'basePath',
  'https://cdn.jsdelivr.net/npm/ace-builds@1.4.8/src-noconflict/',
)
ace.config.setModuleUrl(
  'ace/mode/javascript_worker',
  'https://cdn.jsdelivr.net/npm/ace-builds@1.4.8/src-noconflict/worker-javascript.js',
)

type CodeEditorProps = {
  label?: string
  readOnly?: boolean
  defaultValue?: string
  setCodeInput: React.Dispatch<React.SetStateAction<string>>
}

export function CodeEditor({ label, setCodeInput , readOnly, defaultValue }: CodeEditorProps) {
  function onChange(value: string) {
    setCodeInput(value)
  }

  return (
    <FieldWrapper label={label}>
      <AceEditor
        style={{ width: '100%' }}
        mode="javascript"
        theme="solarized_light"
        defaultValue={defaultValue}
        onChange={onChange}
        name="UNIQUE_ID_OF_DIV"
        readOnly={readOnly}
        editorProps={{ $blockScrolling: true }}
        fontSize={14}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 2,
        }}
      />
    </FieldWrapper>
  )
}
