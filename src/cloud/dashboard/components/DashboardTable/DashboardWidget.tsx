import { useTranslation } from "react-i18next";
import { useCreateDashboard } from "../../api/createDashboard";
import { Button } from "~/components/Button/Button";

import btnSubmitIcon from '~/assets/icons/btn-submit.svg';
import btnCancelIcon from '~/assets/icons/btn-cancel.svg';
import btnEditIcon from '~/assets/icons/btn-edit.svg';
import { useState } from "react";
import { CreateConfigChart } from "./CreateConfigChart";
import { FormDialog } from "~/components/FormDialog";
import { CreateWidgetItemDTO, useCreateWidgetItem } from "../../api/createWidgetItem";
import { Form, FormDrawer, InputField } from "~/components/Form";
import { PlusIcon } from "~/components/SVGIcons";
import GridLayout from "react-grid-layout";
import storage from "~/utils/storage";
import { WidgetItem } from "../Widget";

export function DashboardWidget() {
  const { t } = useTranslation()

  const { id: projectId } = storage.getProject()

  const { mutate, isLoading, isSuccess } = useCreateDashboard()
  const [selectedWidget, setWidgetChecked] = useState('')
  const [showingConfigDialog, setShowingConfigDialog] = useState(false)

  const {
    isLoading: isLoadingThing,
    isSuccess: isSuccessThing,
  } = useCreateWidgetItem()
  const [editMode, toggleEdit] = useState(false)

  const layout = [
    { i: "blue-eyes-dragon", x: 0, y: 0, w: 1, h: 1 },
    { i: "dark-magician", x: 1, y: 0, w: 1, h: 1 },
    { i: "kuriboh", x: 2, y: 0, w: 1, h: 1 },
    { i: "spell-caster", x: 3, y: 0, w: 1, h: 1 },
    { i: "summoned-skull", x: 4, y: 0, w: 1, h: 1 }
  ];

  return (
    <>
      {
        <GridLayout style={ editMode ? { background: '#f0f0f0' } : {}} layout={layout} cols={8} rowHeight={300} width={1560} maxRows={1} isDraggable={ editMode ? true : false }>
          <WidgetItem title='Blue eye dragon'></WidgetItem>
          <div key="blue-eyes-dragon" style={{background: '#ffffff'}}>
            <div style={{padding: '8px'}}>Blue Eyes Dragon</div>
          </div>
          <div key="dark-magician" style={{background: '#ffffff'}}>
            <div style={{padding: '8px'}}>Dark Magician</div>
          </div>
          <div key="kuriboh" style={{background: '#ffffff'}}>
            <div style={{padding: '8px'}}>Kuriboh</div>
          </div>
          <div key="spell-caster" style={{background: '#ffffff'}}>
            <div style={{padding: '8px'}}>Spell Caster</div>
          </div>
          <div key="summoned-skull" style={{background: '#ffffff'}}>
            <div style={{padding: '8px'}}>Summoned Skull</div>
          </div>
        </GridLayout>
      }
      {editMode ? (
        <div className="flex justify-end">
            <Button
              className="rounded border-none p-3 ml-2"
              variant="secondary"
              size="square"
              onClick={() => toggleEdit(false)}
              startIcon={
                <img src={btnCancelIcon} alt="Cancel" className="h-5 w-5" />
              }
              children="Back"
            />
            <Button
              className="rounded border-none p-3 ml-2"
              form="update-dashboard"
              type="submit"
              size="square"
              isLoading={isLoading}
              onClick={() => toggleEdit(false)}
              startIcon={
                <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
              }
              children="Save"
            />
          { showingConfigDialog ? (
            <div>
              <CreateConfigChart type={'chart'} close={() => setShowingConfigDialog(false)} isOpen={true} handleSubmitChart={(values) => console.log(values)} />
            </div>
          ) : (
            <div>
              <FormDrawer
                isDone={isSuccess}
                title={t('cloud:dashboard.detail_dashboard.add_widget.create')}
                triggerButton={
                  <Button
                    className="h-9 rounded-md ml-2"
                    variant="trans"
                    size="lg"
                    style={{width:'6rem'}}
                    startIcon={<PlusIcon width={15} height={16} viewBox="0 0 16 16" />}
                    children="Widget"
                  />
                }
                submitButton={
                  <></>
                }
              >
                <Form<CreateWidgetItemDTO['data']>
                  id="create-dashboard"
                  onSubmit={values => {
                    mutate({
                      data: {
                        title: values.title,
                        project_id: projectId,
                        configuration: {
                          description: values.description,
                        },
                      },
                    })
                  }}
                >
                  {({ register, formState }) => (
                    <div className="flex gap-x-4">
                      <div className="col-6 w-full">
                        <Button
                          type="button"
                          size="square"
                          className="bg-secondary-400 mb-4"
                          variant="secondaryLight"
                          style={{width: '100%'}}
                          onClick={() => setShowingConfigDialog(true)}
                        >
                          <span>{t('cloud:dashboard.detail_dashboard.add_widget.line_chart')}</span>
                        </Button>
                        <Button
                          type="button"
                          size="square"
                          className="bg-secondary-400 mb-4"
                          variant="secondaryLight"
                          style={{width: '100%'}}
                          onClick={() => setShowingConfigDialog(true)}
                        >
                          <span>{t('cloud:dashboard.detail_dashboard.add_widget.horizontal_bar_chart')}</span>
                        </Button>
                      </div>
                      <div className="col-6 w-full">
                        <Button
                          type="button"
                          size="square"
                          className="bg-secondary-400 mb-4"
                          variant="secondaryLight"
                          style={{width: '100%'}}
                          onClick={() => setShowingConfigDialog(true)}
                        >
                          <span>{t('cloud:dashboard.detail_dashboard.add_widget.map')}</span>
                        </Button>
                        <Button
                          type="button"
                          size="square"
                          className="bg-secondary-400 mb-4"
                          variant="secondaryLight"
                          style={{width: '100%'}}
                          onClick={() => setShowingConfigDialog(true)}
                        >
                          <span>{t('cloud:dashboard.detail_dashboard.add_widget.pie_chart')}</span>
                        </Button>
                      </div>
                      
                    </div>
                  )}
                </Form>
              </FormDrawer>
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-end">
          <Button
            className="rounded"
            form="update-dashboard"
            size="square"
            variant="primary"
            isLoading={isLoading}
            onClick={() => toggleEdit(true)}
            startIcon={
              <img src={btnEditIcon} alt="Edit" className="h-5 w-5" />
            }
            children="Edit"
          />
        </div>
      )}
    </>
  )
}