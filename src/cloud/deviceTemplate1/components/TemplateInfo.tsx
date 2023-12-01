import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import TitleBar from '~/components/Head/TitleBar'
import { useTemplateById } from '../api/getTemplateById'
import { getVNDateFormat } from '~/utils/misc'


export function TemplateInfo() {
  const { t } = useTranslation()

  const params = useParams()
  const templateId = params.templateId as string

  const { data } = useTemplateById({ templateId })
  console.log(data)

  return (
    <>
      <TitleBar title={t('cloud:device_template.info.title')} />
      <div className="flex flex-col gap-y-3 px-9 py-5 shadow-lg">
        <p>
          {t('cloud:device_template.info.flow')}: {data?.rule_chain_id}
        </p>
        <p>
          {t('cloud:device_template.info.provision_key')}: {data?.provision_key}
        </p>
        <p>
          {t('cloud:device_template.info.provision_secret')}:{' '}
          {data?.provision_secret}
        </p>
        <p>
          {t('cloud:device_template.info.created_at')}:{' '}
          {data && getVNDateFormat({ date: data?.created_time * 1000 })}
        </p>
      </div>
    </>
  )
}
