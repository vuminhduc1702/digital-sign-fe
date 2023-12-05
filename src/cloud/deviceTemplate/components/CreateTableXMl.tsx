import { parseString } from 'xml2js'
import React, { useEffect, useState } from 'react'
import { InputField } from '~/components/Form'
import { Checkbox } from '~/components/Checkbox'
import { useTranslation } from 'react-i18next'
type Resource = {
  ID: string
  Name: string
  Operations: string
}

export const CreateTableXMl: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([])
  const { t } = useTranslation()
  useEffect(() => {
    const fetchXML = async () => {
      try {
        const xmlPath = '/9.xml'
        const response = await fetch(xmlPath)
        const xmlData = await response.text()

        parseString(xmlData, (err, result) => {
          if (!err) {
            const items = result?.LWM2M?.Object?.[0]?.Resources?.[0]?.Item || []
            const extractedResources: Resource[] = items.map((item: any) => ({
              ID: item.$.ID,
              Name: item.Name[0],
              Operations: item.Operations[0],
            }));
            setResources(extractedResources)
          } else {
            console.error('Error parsing XML:', err)
          }
        })
      } catch (error) {
        console.error('Error fetching XML:', error)
      }
    }
    fetchXML();
  }, []);

  return (
    // <div className="mt-3 gap-3 rounded-md bg-slate-200 px-2 py-4">
    <div className="mt-3 gap-3 rounded-md bg-slate-200 px-2 py-4">
      <div className='border-b-2 border-gray-300 grid grow	grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-2'>
            <div className="flex mb-2">
              <div className=" flex items-end "> <p>{t('#ID Resource name')}</p> </div>
                <div className=" ml-auto">
                  <Checkbox
                    className="flex h-5 w-5 ml-5 mb-1"
                  />
                  {t('Attribute')}
                </div>
            </div>
            <div className='flex items-end mb-2 ml-2'>
                {t('Key name')}
            </div> 
      </div>
      {/* <div className=''>
      {resources.map(resource => (
        <section 
          key={resource.ID}
          className='mt-3'
        >
          <div className='grid grow	grid-cols-1 gap-x-3 gap-y-2 md:grid-cols-2'>
            <div className="flex ">
              <div className=" flex items-center justify-center">
                  #{resource.ID} {resource.Name}
              </div>
              <Checkbox
                className="flex h-5 w-5 mt-2 mr-3 ml-auto"
              />
            </div>
            <div className='grid grow	grid-cols-1 gap-x-10 gap-y-2 md:grid-cols-1'>
            <InputField
             className=""
                  // label={t('cloud:org_manage.org_manage.add_attr.name')}
                  // error={formState?.errors?.attributes?.[index]?.attribute_key}
                  // registration={register(
                  //   `attributes.${index}.attribute_key` as const,
                  // )}
                />
            </div> 
          </div>
        </section>
      ))}
      </div> */}
      <div>
      {resources.map(resource => {
        if (resource.Operations === 'RW' || resource.Operations === 'R') {
          return (
            <section 
              key={resource.ID}
              className='mt-3'
            >
              <div className='grid grow grid-cols-1 gap-x-3 gap-y-2 md:grid-cols-2'>
                <div className="flex">
                  <div className="flex items-center justify-center">
                    #{resource.ID} {resource.Name}
                  </div>
                  <Checkbox
                    className="flex h-5 w-5 mt-2 mr-3 ml-auto"
                  />
                </div>
                <div className='grid grow grid-cols-1 gap-x-10 gap-y-2 md:grid-cols-1'>
                  <InputField
                    className=""
                    // label={t('cloud:org_manage.org_manage.add_attr.name')}
                    // error={formState?.errors?.attributes?.[index]?.attribute_key}
                    // registration={register(
                    //   `attributes.${index}.attribute_key` as const,
                    // )}
                  />
                </div> 
              </div>
            </section>
          )
        }
        return null
      })}
      </div>
    </div>
  )
}


