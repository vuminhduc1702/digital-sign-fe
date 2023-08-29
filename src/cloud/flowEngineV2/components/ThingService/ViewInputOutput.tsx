import { useTranslation } from 'react-i18next'

import { XMarkIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { CodeEditor } from '~/cloud/customProtocol/components'
import { Dialog, DialogTitle } from '~/components/Dialog'
import { type BodyEventService } from '../../types'

type ViewInputOutputProps = {
  type: string
  body: BodyEventService
  close: () => void
  isOpen: boolean
}
export function ViewInputOutput({
  type,
  body,
  close,
  isOpen,
}: ViewInputOutputProps) {
  const { t } = useTranslation()

  const [codeOutput, setCodeOutput] = useState(body?.output || '')
  const [codeInput, setCodeInput] = useState('')

  useEffect(() => {
    const inputParse = JSON.stringify(JSON.parse(body?.input), null, '\t')
    setCodeInput(inputParse)
    try {
      const outPutParse = JSON.stringify(JSON.parse(body?.output), null, '\t')
      setCodeOutput(outPutParse)
    } catch (err) {
      setCodeOutput(body?.output)
    }
  }, [body])

  return (
    <Dialog isOpen={isOpen} onClose={() => null}>
      <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:p-6 sm:align-middle">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <div className="flex items-center justify-between">
            <DialogTitle as="h3" className="text-h1 text-secondary-900">
              {type === 'input'
                ? t('cloud:custom_protocol.service.input')
                : t('cloud:custom_protocol.service.output')}
            </DialogTitle>
            <div className="ml-3 flex h-7 items-center">
              <button
                className="rounded-md bg-white text-secondary-900 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-600"
                onClick={close}
              >
                <span className="sr-only">Close panel</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="mt-4 w-[50rem]">
            <CodeEditor
              defaultValue={type === 'input' ? codeInput : codeOutput}
              setCodeInput={type === 'input' ? setCodeInput : setCodeOutput}
              readOnly={true}
            />
          </div>
        </div>
      </div>
    </Dialog>
  )
}