import { useState } from 'react'
import { NavLink } from '@/components/Link'
import { PATHS } from '@/routes/PATHS'
import { cn } from '@/utils/misc'
import { TemplateDefault } from './TemplateDefault'
import { TemplateLwM2M } from './TemplateLwM2M'
import storage from '@/utils/storage'
export function TemplateSidebar() {
  const [type, setType] = useState('Default')
  const projectId = storage.getProject()?.id
  const DeviceType = ['Default', 'Other']
  return (
    <>
      <div className="flex h-[60px] items-center gap-2 bg-secondary-400 px-4 py-3">
        <div className="w-fit rounded-2xl bg-slate-200">
          {DeviceType.map(item => (
            <NavLink
              to={
                item === 'Default'
                  ? PATHS.TEMPLATE_DEFAULT + '/' + projectId
                  : PATHS.TEMPLATE_OTHER + '/' + projectId
              }
              key={item}
            >
              <button
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
            </NavLink>
          ))}
        </div>
      </div>
      <div className="h-[80vh] grow overflow-y-auto bg-secondary-500 p-3">
        {type === 'Default' ? <TemplateDefault /> : <TemplateLwM2M />}
      </div>
    </>
  )
}
