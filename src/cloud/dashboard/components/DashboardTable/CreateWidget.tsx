import { useTranslation } from "react-i18next";
import { useCreateDashboard } from "../../api/createDashboard";
import { Button } from "~/components/Button/Button";
import { CreateDashboardItem } from "./CreateDashboardItem";

import btnSubmitIcon from '~/assets/icons/btn-submit.svg';
import btnCancelIcon from '~/assets/icons/btn-cancel.svg';
import btnEditIcon from '~/assets/icons/btn-edit.svg';
import { useState } from "react";

export function CreateWidget() {
  const { t } = useTranslation()

  const { mutate, isLoading, isSuccess } = useCreateDashboard()

  const [editMode, toggleEdit] = useState(true)

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
          <CreateDashboardItem />
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
    </>
  )
}