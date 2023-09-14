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
import { Form } from "~/components/Form";
import { PlusIcon } from "~/components/SVGIcons";
import GridLayout from "react-grid-layout";

export function CreateWidget() {
  const { t } = useTranslation()

  const { mutate, isLoading, isSuccess } = useCreateDashboard()
  const [selectedWidget, setWidgetChecked] = useState('')
  const [showingConfigDialog, setShowingConfigDialog] = useState(false)

  const {
    isLoading: isLoadingThing,
    isSuccess: isSuccessThing,
  } = useCreateWidgetItem()
  const [editMode, toggleEdit] = useState(true)

  const layout = [
    { i: "blue-eyes-dragon", x: 0, y: 0, w: 1, h: 1 },
    { i: "dark-magician", x: 1, y: 0, w: 1, h: 1 },
    { i: "kuriboh", x: 2, y: 0, w: 1, h: 1 },
    { i: "spell-caster", x: 3, y: 0, w: 1, h: 1 },
    { i: "summoned-skull", x: 4, y: 0, w: 1, h: 1 }
  ];

  return (
    <>
      {editMode ? (
        <div className="flex">
            <Button
              className="rounded border-none p-3"
              variant="secondary"
              size="square"
              onClick={() => toggleEdit(false)}
              startIcon={
                <img src={btnCancelIcon} alt="Cancel" className="h-5 w-5" />
              }
            />
            <Button
              className="rounded border-none p-3"
              form="update-dashboard"
              type="submit"
              size="square"
              isLoading={isLoading}
              onClick={() => toggleEdit(false)}
              startIcon={
                <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
              }
            />
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
                        <div className="col-4">
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
                        </div>
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
        </div>
        ) : (
          <div className="flex">
            <Button
              className="rounded"
              form="update-dashboard"
              size="square"
              variant="trans"
              isLoading={isLoading}
              onClick={() => toggleEdit(true)}
              startIcon={
                <img src={btnEditIcon} alt="Edit" className="h-5 w-5" />
              }
            />
          </div>
        )}
        {
          <GridLayout layout={layout} cols={8} rowHeight={300} width={1560} maxRows={1}>
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
    </>
  )
}