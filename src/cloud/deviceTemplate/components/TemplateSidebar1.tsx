import { useState } from 'react'
import { cn } from '~/utils/misc'


import { TemplateDefault } from './TemplateDefault'
import { TemplateLwM2M } from './TemplateLwM2M'

export function TemplateSidebar1() {
  const [type, setType] = useState('LwM2M')
  const DeviceType = ['Default', 'LwM2M']
  return (
    <>
      <div className="flex h-[60px] items-center gap-2 bg-secondary-400 px-4 py-3">
        <div className="w-fit rounded-2xl bg-slate-200">
            {DeviceType.map(item => {
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setType(item)
                  }}
                  className={cn('px-4 py-2 text-slate-400', {
                    'bg-primary-400 rounded-2xl text-white': type === item,
                  })}
                >
                  {item}
                </button>
              )
            })}
        </div>
      </div>
      <div className="h-[80vh] grow overflow-y-auto bg-secondary-500 p-3">
      {type === 'LwM2M' ? (
            <TemplateLwM2M/>
          ) : (
            <TemplateDefault/>
          )}
      </div>
    </>
  )
}
