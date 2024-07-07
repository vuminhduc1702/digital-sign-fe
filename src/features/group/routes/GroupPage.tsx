import TitleBar from "@/components/Head/TitleBar";
import { ContentLayout } from "@/layout/ContentLayout";
import { useTranslation } from "react-i18next";
import { GroupTable } from "../components/GroupTable";

export function GroupPage() {
    const {t} = useTranslation()
    return (
        <div>
            <ContentLayout title={t('sidebar:group')}>
                <div>
                    <TitleBar title={t('group:title')}/>
                    <GroupTable />
                </div>
            </ContentLayout>
        </div>
    )
}