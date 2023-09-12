import { useTranslation } from 'react-i18next'
import btnSubmitIcon from '~/assets/icons/btn-submit.svg'
import { Form } from '~/components/Form'
import { Button } from '~/components/Button'
import { PlusIcon } from '~/components/SVGIcons'
import { FormDialog } from '~/components/FormDialog'
import storage from '~/utils/storage'
import { useState } from 'react'
import { CreateWidgetItemDTO, useCreateWidgetItem } from '../../api/createWidgetItem'
import { CreateConfigChart } from './CreateConfigChart'

const WidgetType = [
  { id: 'bar', value: 'BAR'},
  { id: 'gauge', value: 'GAUGE'},
  { id: 'line', value: 'LINE'},
  { id: 'pie', value: 'PIE'},
  { id: 'map', value: 'MAP'},
  { id: 'table', value: 'TABLE'}
]

export function CreateWidgetItem() {
  const { t } = useTranslation()

 const [selectedWidget, setWidgetChecked] = useState('')
 const [showingConfigDialog, setShowingConfigDialog] = useState(false)

  const { id: projectId } = storage.getProject()

  const {
    isLoading: isLoadingThing,
    isSuccess: isSuccessThing,
  } = useCreateWidgetItem()
  
  return (
    <>
      { showingConfigDialog ? (
        <div>
          <CreateConfigChart type={'chart'} close={() => setShowingConfigDialog(false)} isOpen={true} handleSubmitChart={(values) => console.log(values)} />
        </div>
      ) : (
        <div>
        <FormDialog
          isDone={isSuccessThing}
          title={t('cloud:dashboard.detail_dashboard.add_item.create')}
          body={
            <Form<CreateWidgetItemDTO['data']>
              id="create-dashboard-item"
              className="flex flex-col justify-between"
              onSubmit={() => {}}
          >
          {({ register, formState }) => {
            return (
              <>
                <div className="col-12">
                  <div className="flex">
                    <div className="col-4">
                      <Button
                        type="button"
                        size="square"
                        className="bg-secondary-400"
                        variant="secondaryLight"
                        style={{width: '100%'}}
                        onClick={() => setShowingConfigDialog(true)}
                      >
                        <span>{t('cloud:dashboard.detail_dashboard.add_item.line_chart')}</span>
                      </Button>
                    </div>
                    {/* <div className="col-4">
                      <Button
                        type="button"
                        size="square"
                        className="bg-secondary-400ml-5 mr-5"
                        variant="secondaryLight"
                        style={{width: '100%'}}
                      >
                        <span>{t('cloud:dashboard.detail_dashboard.add_item.horizontal_bar_chart')}</span>
                      </Button>
                    </div>
                    <div className="col-4">
                      <Button
                        type="button"
                        size="square"
                        className="bg-secondary-400"
                        variant="secondaryLight"
                        style={{width: '100%'}}
                      >
                        <span>{t('cloud:dashboard.detail_dashboard.add_item.pie_chart')}</span>
                      </Button>
                    </div> */}
                  </div>
                </div>
              </>
            )
          }}
        </Form>
        }
        triggerButton={
          <Button
            className="rounded-md"
            variant="trans"
            size="square"
            startIcon={<PlusIcon width={16} height={16} viewBox="0 0 16 16" />}
          />
        }
        confirmButton={
          <Button
            isLoading={isLoadingThing}
            form="create-entityThing"
            type="submit"
            size="md"
            className="bg-primary-400"
            startIcon={
              <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
            }
          />
        }
        />
        </div>
      )}
    </>
  )
}